import { Injectable, Logger } from '@nestjs/common';
// import Gemini client dynamically to avoid type mismatch with package typings
const GenerativeAI: any = require('@google/generative-ai');

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
  private client: any | null = null;

  constructor() {
    // initialize Gemini client only if key is present
    const key = process.env.GEMINI_API_KEY || null;
    if (key) {
      try {
        // store the module to call generate later. The concrete client/shape may vary by version.
        this.client = GenerativeAI;
      } catch (err) {
        this.logger.warn('Falha ao inicializar cliente Gemini, fallback para heurística', err as any);
        this.client = null;
      }
    }
  }

  // Faz análise com o LLM Gemini. Retorna { score, summary, suggestions }
  private async analyzeWithGemini(name: string, content: string): Promise<Pick<DocAnalysis, 'score' | 'summary' | 'suggestions'>> {
    const axios = require('axios');

    const apiKey = process.env.GEMINI_API_KEY || null;
    const modelEnv = process.env.GEMINI_MODEL;

    const prompt = `You are a meticulous technical documentation reviewer. Given the document content, return ONLY a JSON object with keys: score (integer 0-100), summary (short string <= 200 chars), and suggestions (array of up to 6 concise actionable suggestions). Evaluate clarity, completeness, sections (installation, usage, contributing), examples, structure, and potential missing items. Do not output any other text. Document name: ${name}. Document content follows between CONTENT_START and CONTENT_END.\nCONTENT_START\n${content}\nCONTENT_END`;

    // 1) try to use the installed SDK in common shapes
    try {
      const GenerativeAI: any = this.client || require('@google/generative-ai');

      // shape: TextServiceClient
      if (GenerativeAI.TextServiceClient) {
        const Client = GenerativeAI.TextServiceClient;
        const client = new Client();
        // try different method names that may exist
        let res: any;
        if (typeof client.generateText === 'function') {
          res = await client.generateText({ model: modelEnv, prompt: { text: prompt }, maxOutputTokens: 512 });
        } else if (typeof client.generate === 'function') {
          res = await client.generate({ model: modelEnv, input: prompt, maxOutputTokens: 512 });
        }
        const text = res?.candidates?.[0]?.content ?? res?.output ?? res?.result?.content ?? JSON.stringify(res);
        const json = this.extractJson(text);
        return this.normalizeParsed(json);
      }

      // shape: module.text.generate
      if (GenerativeAI.text && typeof GenerativeAI.text.generate === 'function') {
        const res = await GenerativeAI.text.generate({ model: modelEnv, prompt: { text: prompt }, maxOutputTokens: 512 });
        const text = res?.candidates?.[0]?.content ?? res?.output ?? JSON.stringify(res);
        const json = this.extractJson(text);
        return this.normalizeParsed(json);
      }

      // shape: direct generate function
      if (typeof GenerativeAI.generate === 'function') {
        const res = await GenerativeAI.generate({ model: modelEnv, prompt, maxOutputTokens: 512 });
        const text = res?.candidates?.[0]?.output ?? res?.output ?? JSON.stringify(res);
        const json = this.extractJson(text);
        return this.normalizeParsed(json);
      }
    } catch (libErr) {
      this.logger.warn('Library call to Gemini failed or not supported, will attempt REST fallback', libErr as any);
    }

    // 2) REST fallback to Generative Language API
    if (!apiKey) {
      throw new Error('No Gemini/Google API key found in env (GEMINI_API_KEY or GOOGLE_API_KEY)');
    }

    const versions = ['v1beta2', 'v1'];
    const modelsToTry = [modelEnv, process.env.GEMINI_MODEL || 'models/gemini-1.0', 'text-bison-001', 'models/text-bison-001'];

    for (const ver of versions) {
      for (const model of modelsToTry) {
        if (!model) continue;
        const endpointModel = encodeURIComponent(model);
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${endpointModel}:generate?key=${apiKey}`;
        const body = { prompt: { text: prompt }, maxOutputTokens: 512 };
        try {
          const res = await axios.post(url, body, { timeout: 20000 });
          const data = res.data;
          const text = data?.candidates?.[0]?.content ?? data?.output ?? JSON.stringify(data);
          const json = this.extractJson(text);
          return this.normalizeParsed(json);
        } catch (err) {
          const status = err?.response?.status;
          const bodyResp = err?.response?.data;
          this.logger.warn(`Generative API REST attempt failed (ver=${ver}, model=${model}, status=${status})`, bodyResp);

          // If auth issues, rethrow to let upper layer handle
          if (status === 401 || status === 403) {
            throw new Error(`Authentication/permission error calling Generative API (status ${status}). Check API key and IAM permissions.`);
          }

          // otherwise continue to next model/version
        }
      }
    }

    throw new Error('All REST attempts to Generative API failed; check logs for details.');
  }

  // helper: extract JSON object from text block
  private extractJson(text: string): any {
    if (!text) return {};
    const idx = text.indexOf('{');
    const candidate = idx >= 0 ? text.slice(idx) : text;
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // try to recover by finding last brace
      const last = candidate.lastIndexOf('}');
      if (last > 0) {
        try {
          return JSON.parse(candidate.slice(0, last + 1));
        } catch (e2) {
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
    const hasBadge = /\[!\[|badge|shields.io|img.shields.io/mi.test(content);
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
    // If no content, return quickly
    if (!content) return this.heuristicAnalyze(name, null);

    if (!this.client) {
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
    } catch (err) {
      // fallback
      return this.heuristicAnalyze(name, content);
    }
  }

  // Analisa múltiplos documentos de uma só vez
  async analyzeMany(docs: { name: string; content: string | null }[]) {
    const promises = docs.map(d => this.analyzeText(d.name, d.content));
    return Promise.all(promises);
  }
}
