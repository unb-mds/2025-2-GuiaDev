import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  private readonly apiKey = process.env.GEMINI_API_KEY ?? '';
  private readonly model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').replace(/^models\//, '');

  private client: GoogleGenerativeAI | null = null;

  constructor() {
    if (this.apiKey) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
      } catch (err) {
        this.logger.warn('Falha ao inicializar cliente Gemini', err as any);
        this.client = null;
      }
    }
  }

  // Constrói o prompt para o modelo Gemini
  private buildPrompt(name: string, content: string) {
    return `Assunto: Análise de Documentação de Repositório de Software

Persona: Você é um agente de IA especialista em engenharia de software, com foco em boas práticas de documentação técnica.

Objetivo: Sua tarefa é analisar arquivos de documentação de um repositório de software.
Para cada arquivo, você deve verificar se ele existe e, em seguida, avaliá-lo com base em um conjunto de regras, 
retornando sua análise em um formato JSON específico.

Formato de Saída Obrigatório: Sua resposta DEVE ser um único OBJETO JSON. Cada objeto representa um arquivo analisado e deve conter exatamente as seguintes chaves:


  {
    "name": "nome-do-arquivo.md",
    "exists": true,
    "score": 0,
    "summary": "",
    "suggestions": []
  }


Regras de Análise Detalhadas
Você deve aplicar as seguintes regras para cada arquivo  de entrada:

Regra 1: O Arquivo NÃO EXISTE
Se o arquivo não for encontrado no repositório:

"exists": false

"score": 0

"summary": "" (uma string vazia)

"suggestions": [ "Sugerir adicionar este documento ao repositório atendendo as boas práticas de escrita técnica." ]

Regra 2: O Arquivo EXISTE (Análise Padrão)
Esta regra se aplica a todos os arquivos que existem, EXCETO o arquivo LICENSE.

"exists": true

"summary": Leia e analise o conteúdo completo do arquivo e, em seguida, escreva um breve resumo (1-2 frases) explicando por que este tipo de documento é essencial para um projeto de software.

"score": Atribua uma pontuação de 0 a 100.

A pontuação deve avaliar a qualidade e completude do conteúdo com base nas boas práticas de escrita técnica para aquele tipo específico de documento.

Por exemplo: Um README.md deve ter descrição do projeto, instruções de instalação, exemplos de uso, etc. Um CONTRIBUTING.md deve ter guia de ambiente, fluxo de pull request, etc.

Um arquivo vazio ou com conteúdo mínimo deve receber uma pontuação baixa (próxima de 0).

Um arquivo completo, claro e bem estruturado deve receber uma pontuação alta (próxima de 100).

"suggestions": Gere uma lista de strings contendo sugestões de melhoria claras e acionáveis para o documento, com base no que foi observado na análise de conteúdo.

Regra 3: Caso Especial - Pontuação Máxima
Se a análise da Regra 2 resultar em um "score" de 100 (ou seja, o documento é considerado perfeito e atende a todos os requisitos de boas práticas):

O campo "suggestions" deve ser: [ "Documento OK." ]

Regra 4: Caso Especial - O Arquivo LICENSE
O arquivo LICENSE (ou LICENSE.md) segue regras binárias e não deve ter seu conteúdo analisado para qualidade, apenas para existência.

Se o arquivo LICENSE EXISTIR:

"exists": true

"score": 100

"summary": "Define os termos legais, permissões e limitações sob os quais o software pode ser usado, modificado e distribuído."

"suggestions": [ "Documento OK." ]

Se o arquivo LICENSE NÃO EXISTIR:

"exists": false

"score": 0

"summary": ""

"suggestions": [ "Adicionar um arquivo LICENSE para garantir a clareza legal e proteger o projeto e seus usuários." ]

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
    const axios = require('axios');
    const prompt = this.buildPrompt(name, content);

    // Tenta via SDK oficial (@google/generative-ai) se inicializado
    if (this.client) {
      try {
        const model = this.client.getGenerativeModel({
          model: this.model,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          } as any,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const text = result?.response?.text?.() ?? '';
        const json = this.extractJson(text);
        return this.normalizeParsed(json);
      } catch (libErr) {
        this.logger.warn('Library call to Gemini falhou', libErr as any);
        throw libErr;
      }
    }

    // Se SDK não estiver disponível, usa REST v1
    if (!this.apiKey) {
      throw new Error('No Gemini/Google API key found in env (GEMINI_API_KEY or GOOGLE_API_KEY)');
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
      this.model
    )}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
        response_mime_type: 'application/json',
      },
    };

    try {
      const res = await axios.post(url, body, { timeout: 25000 });
      const data = res.data;

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

      if (status === 401 || status === 403) {
        throw new Error(
          `Authentication/permission error calling Generative API (status ${status}). Check API key and IAM permissions.`
        );
      }
      throw err;
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



  // Public API: analyzeText -> usa somente Gemini
  async analyzeText(name: string, content: string | null): Promise<DocAnalysis> {
    // Caso 1: Arquivo NÃO EXISTE (Regra 1 do prompt)
    if (content === null) {
      // O arquivo "LICENSE" é um caso especial
      if (name.toUpperCase() === 'LICENSE' || name.toUpperCase() === 'LICENSE.MD') {
        return {
          name,
          exists: false,
          score: 0,
          summary: '',
          suggestions: [
            'Adicionar um arquivo LICENSE para garantir a clareza legal e proteger o projeto e seus usuários.',
          ],
        };
      }
      // Demais arquivos
      return {
        name,
        exists: false,
        score: 0,
        summary: '',
        suggestions: [
          'Sugerir adicionar este documento ao repositório atendendo as boas práticas de escrita técnica.',
        ],
      };
    }

    // Caso 2: Arquivo EXISTE, MAS ESTÁ VAZIO
    if (content.trim() === '') {
      return {
        name,
        exists: true,
        score: 0,
        summary: 'O arquivo existe, mas está vazio.',
        suggestions: ['Preencher o documento com conteúdo relevante seguindo as boas práticas.'],
      };
    }

    // Caso 3: Arquivo EXISTE e tem conteúdo (Chamar a IA)
    if (!this.client && !this.apiKey) {
      throw new Error('Gemini is not configured. Set GEMINI_API_KEY or initialize the SDK client.');
    }

    // Caso especial LICENSE (Regra 4) - Se existe e tem conteúdo, não precisa analisar
    if (name.toUpperCase() === 'LICENSE' || name.toUpperCase() === 'LICENSE.MD') {
      return {
        name,
        exists: true,
        score: 100,
        summary:
          'Define os termos legais, permissões e limitações sob os quais o software pode ser usado, modificado e distribuído.',
        suggestions: ['Documento OK.'], // Alterado de "Tudo certo." para "Documento OK." para bater com a Regra 3
      };
    }

    // Somente chama a IA para arquivos normais que têm conteúdo
    const llm = await this.analyzeWithGemini(name, content);
    return {
      name,
      exists: true,
      score: llm.score,
      summary: llm.summary,
      suggestions: llm.suggestions,
    };
  }

  // Analisa múltiplos documentos de uma só vez
  async analyzeMany(docs: { name: string; content: string | null }[]) {
    const promises = docs.map(d => this.analyzeText(d.name, d.content));
    return Promise.all(promises);
  }
}