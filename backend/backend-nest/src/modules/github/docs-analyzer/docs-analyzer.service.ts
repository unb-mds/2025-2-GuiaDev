import { Injectable, Logger } from '@nestjs/common';
// REMOVED: require dinâmico e formas legadas do SDK
// const GenerativeAI: any = require('@google/generative-ai');
// CHANGED: usar o SDK oficial tipado e simples
import { GoogleGenerativeAI } from '@google/generative-ai'; // CHANGED

export type DocAnalysis = {
  name: string;
  exists: boolean;
  score: number; // 0..100
  summary: string;
  suggestions: string[];
};

@Injectable()
export class DocsAnalyzerService {
  private readonly logger = new Logger(DocsAnalyzerService.name);
  // CHANGED: centralizar envs e sanitizar modelo aqui
  private readonly apiKey = process.env.GEMINI_API_KEY ?? ''; // CHANGED
  private readonly model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash') // CHANGED
    .replace(/^models\//, ''); // CHANGED: evita models/models/...

  private client: GoogleGenerativeAI | null = null; // CHANGED: tipado

  constructor() {
    // CHANGED: inicialização simples do SDK oficial
    if (this.apiKey) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey); // CHANGED
      } catch (err) {
        this.logger.warn('Falha ao inicializar cliente Gemini, fallback para heurística', err as any);
        this.client = null;
      }
    }
  }

  // CHANGED: prompt separado para reaproveitar
  private buildPrompt(name: string, content: string) { // NEW
    return `Você é um avaliador técnico de documentação.
Analise o conteúdo do documento abaixo e responda SOMENTE com um objeto JSON.
O objeto deve conter:
- "score": um número inteiro entre 0 e 100 (sem aspas)
- "summary": um resumo curto em português (até 200 caracteres)
- "suggestions": uma lista de até 6 sugestões curtas em português

Avalie a clareza, completude, presença de seções (Instalação, Uso, Contribuição), exemplos e estrutura de acordo com as boas práticas de cada documento específico.
Document name: ${name}.
CONTENT_START
${content}
CONTENT_END`;
  }

  // Faz análise com o LLM Gemini. Retorna { score, summary, suggestions }
  private async analyzeWithGemini(
    name: string,
    content: string
  ): Promise<Pick<DocAnalysis, 'score' | 'summary' | 'suggestions'>> {
    const axios = require('axios'); // mantive axios
    const prompt = this.buildPrompt(name, content); // CHANGED

    // 1) Tenta via SDK oficial (@google/generative-ai)
    if (this.client) {
      try {
        // CHANGED: uso do generateContent com responseMimeType JSON
        const model = this.client.getGenerativeModel({
          model: this.model, // CHANGED
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json', // CHANGED: força JSON
          } as any,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }); // CHANGED

        // CHANGED: leitura consistente do texto
        const text = result?.response?.text?.() ?? '';
        const json = this.extractJson(text);
        return this.normalizeParsed(json);
      } catch (libErr) {
        this.logger.warn('Library call to Gemini falhou; tentando REST v1 generateContent', libErr as any);
      }
    }

    // 2) REST fallback (Generative Language API v1)
    if (!this.apiKey) {
      throw new Error('No Gemini/Google API key found in env (GEMINI_API_KEY or GOOGLE_API_KEY)');
    }

    // CHANGED: endpoint correto v1 + :generateContent
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
      this.model
    )}:generateContent?key=${this.apiKey}`; // CHANGED

    // CHANGED: payload no formato contents/parts e response_mime_type
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }], // CHANGED
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
        response_mime_type: 'application/json', // CHANGED
      },
    };

    try {
      const res = await axios.post(url, body, { timeout: 25000 });
      const data = res.data;

      // CHANGED: caminhos atuais de resposta
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.parts?.[0]?.stringValue ??
        '';

      const json = this.extractJson(text);
      return this.normalizeParsed(json);
    } catch (err: any) {
      const status = err?.response?.status;
      const bodyResp = err?.response?.data;
      this.logger.warn(
        `Generative API REST attempt failed (v1, model=${this.model}, status=${status})`,
        bodyResp
      );

      // CHANGED: só relançar auth; demais deixam cair na heurística
      if (status === 401 || status === 403) {
        throw new Error(
          `Authentication/permission error calling Generative API (status ${status}). Check API key and IAM permissions.`
        ); // CHANGED
      }
      // para outros erros, deixamos cair para heurística no chamador
      throw err; // CHANGED
    }
  }

  // helper: extract JSON object from text block
  private extractJson(text: string): any {
    if (!text) return {};
    const idx = text.indexOf('{');
    const candidate = idx >= 0 ? text.slice(idx) : text;
    try {
      return JSON.parse(candidate);
    } catch {
      // try to recover by finding last brace
      const last = candidate.lastIndexOf('}');
      if (last > 0) {
        try {
          return JSON.parse(candidate.slice(0, last + 1));
        } catch {
          return {};
        }
      }
      return {};
    }
  }

  // helper: normalize parsed JSON to expected output
  private normalizeParsed(parsed: any): { score: number; summary: string; suggestions: string[] } {
    return {
      score: Math.max(0, Math.min(100, Number(parsed?.score) || 0)),
      summary: String(parsed?.summary || '').slice(0, 1000),
      suggestions: Array.isArray(parsed?.suggestions) ? parsed.suggestions.slice(0, 6).map(String) : [],
    };
  }

  // Heuristic fallback (kept from original implementation)
  private heuristicAnalyze(name: string, content: string | null): DocAnalysis {
    if (!content) {
      return {
        name,
        exists: false,
        score: 0,
        summary: `${name} não encontrado no repositório`,
        suggestions: [`Adicione um ${name} com propósito e estrutura claros.`],
      };
    }

    const length = content.trim().length;
    const lines = content.split(/\r?\n/).length;
    const hasTitle = /^#\s+.+/m.test(content);
    // CHANGED: regex tinha um bug (".mi.test"), corrigi e escapei pontos
    const hasBadge = /\[!\[|badge|shields\.io|img\.shields\.io/mi.test(content); // CHANGED
    const hasTOC = /(^##\s+Table of Contents|\- \[)/mi.test(content);

    let score = Math.min(60, Math.floor(Math.log10(Math.max(1, length)) * 10));

    if (hasTitle) score += 15;
    if (lines > 10) score += 10;
    if (hasTOC) score += 10;
    if (hasBadge) score += 5;

    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];

    if (!hasTitle) suggestions.push('Adicione um título de nível superior (e.g. `# Nome do Projeto`)');
    if (lines < 5) suggestions.push('Expanda o documento com propósito, instalação, uso e exemplos.');
    if (!hasTOC && lines > 20) suggestions.push('Adicione uma Tabela de Conteúdos para ajudar a navegar em um README longo.');
    if (!/##\s+Installation/mi.test(content)) suggestions.push('Adicione uma seção `Instalação` com etapas para executar o projeto localmente.');
    if (!/##\s+Usage/mi.test(content)) suggestions.push('Adicione uma seção `Casos de Uso` com exemplos e saídas esperadas.');
    if (!/##\s+Contributing/mi.test(content)) suggestions.push('Adicione uma seção `Contribuição` para orientar potenciais colaboradores.');

    const summary = `Heurística de análise produziu uma pontuação de ${score}/100. Título encontrado: ${hasTitle}, linhas: ${lines}.`;

    return {
      name,
      exists: true,
      score,
      summary,
      suggestions,
    };
  }

  // Public API: analyzeText -> tries Gemini if available, otherwise heuristic
  async analyzeText(name: string, content: string | null): Promise<DocAnalysis> {
    // Se não há conteúdo, retorna rápido
    if (!content) return this.heuristicAnalyze(name, null);

    // CHANGED: tenta LLM; se falhar, cai na heurística
    if (!this.client && !this.apiKey) { // CHANGED
      return this.heuristicAnalyze(name, content);
    }

    try {
      const llm = await this.analyzeWithGemini(name, content);
      return {
        name,
        exists: true,
        score: llm.score,
        summary: llm.summary,
        suggestions: llm.suggestions,
      };
    } catch {
      return this.heuristicAnalyze(name, content);
    }
  }

  // Analisa múltiplos documentos de uma só vez
  async analyzeMany(docs: { name: string; content: string | null }[]) {
    const promises = docs.map(d => this.analyzeText(d.name, d.content));
    return Promise.all(promises);
  }
}