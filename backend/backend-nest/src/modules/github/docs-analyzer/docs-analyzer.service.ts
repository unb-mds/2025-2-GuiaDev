import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export type DocAnalysis = {
  name: string;
  exists: boolean;
  score: number; // 0..100
  summary: string;
  suggestions: string[];
  // compatível para frente: opcional; quem não usar, ignora
 // content_evidence?: {
   // non_empty: boolean;
   // length: number;
   // sha256: string;
 // };
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

  //  utils 
  private normalizeNewlines(s: string) {
    return s.replace(/\r\n/g, '\n');
  }
  private sha256Hex(data: string) {
    //  manter compatível com Node 16+ via createHash dinâmico
    const { createHash } = require('crypto');
    return createHash('sha256').update(data).digest('hex');
  }
  private isLicense(name: string) {
    const n = name.toLowerCase();
    return n === 'license' || n === 'license.md';
  }

  //  prompt (1 arquivo - OBJETO) 
  private buildPrompt(name: string, content: string) {
    return [
      'Assunto: Análise de Documentação de Repositório de Software',
      '',
      'Persona: Você é um agente de IA especialista em engenharia de software, com foco em boas práticas de documentação técnica.',
      '',
      'Objetivo: Analisar UM arquivo de documentação do repositório e retornar um OBJETO JSON com exatamente as chaves: score, summary, suggestions.',
      '',
      'Instruções de saída (OBRIGATÓRIO):',
      '- Responda com um ÚNICO OBJETO JSON, sem texto extra, sem comentários, sem cercas de código.',
      '- Formato: { "score": 0, "summary": "", "suggestions": [] }',
      '',
      'Regras de avaliação (exceto LICENSE):',
      '- summary: 1–2 frases explicando por que este tipo de documento é essencial + síntese do conteúdo.',
      '- score: inteiro 0–100 (0–20 vazio; 21–60 incompleto; 61–85 bom; 86–99 excelente; 100 exemplar).',
      "- suggestions: 3–8 melhorias acionáveis (começando com verbos), ou ['Documento OK.'] se score=100.",
      '',
      'Critérios por tipo (se aplicável):',
      '- README(.md): visão geral, objetivos, pré-requisitos, instalação, configuração, exemplos, run/test/build, estrutura, roadmap/estado, link p/ CONTRIBUTING, licença, badges, links úteis, suporte/contato, i18n, acessibilidade, compatibilidade.',
      '- CONTRIBUTING(.md): setup de ambiente, branches/commits, estilo/linters, testes/coverage, fluxo de PR, codeowners, DCO/CLA, security policy, labels/triagem, tempos de resposta, docs/changelog, versionamento/semver, templates.',
      '',
      `Document name: ${name}`,
      'CONTENT_START',
      content,
      'CONTENT_END',
    ].join('\n');
  }

  //  parser tolerante 
  private stripFences(text: string) {
    return text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  }
  private extractJson(text: string): any {
    if (!text) return {};
    const raw = this.stripFences(text);
    const firstBrace = raw.indexOf('{');
    const firstBracket = raw.indexOf('[');
    let start = -1;
    let isArray = false;

    if (firstBracket >= 0 && (firstBrace < 0 || firstBracket < firstBrace)) {
      start = firstBracket;
      isArray = true;
    } else if (firstBrace >= 0) {
      start = firstBrace;
    }
    const candidate = start >= 0 ? raw.slice(start) : raw;

    const tryParse = (s: string) => {
      try { return JSON.parse(s); } catch { return null; }
    };

    let parsed = tryParse(candidate);
    if (parsed) return parsed;

    const endChar = isArray ? ']' : '}';
    const last = candidate.lastIndexOf(endChar);
    if (last > 0) {
      parsed = tryParse(candidate.slice(0, last + 1));
      if (parsed) return parsed;
    }
    return {};
  }
  private normalizeParsed(parsed: any): { score: number; summary: string; suggestions: string[] } {
    const obj = Array.isArray(parsed) ? parsed[0] : parsed || {};
    const scoreNum = Number(obj.score);
    const summaryStr = typeof obj.summary === 'string' ? obj.summary : '';
    const suggArr = Array.isArray(obj.suggestions) ? obj.suggestions.filter((s: any) => typeof s === 'string') : [];

    const score = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, scoreNum)) : 0;
    const summary = summaryStr.slice(0, 1000);
    const suggestions = suggArr.slice(0, 8);

    return { score, summary, suggestions };
  }

  //  chamada ao Gemini 
  private async analyzeWithGemini(
    name: string,
    content: string
  ): Promise<Pick<DocAnalysis, 'score' | 'summary' | 'suggestions'>> {
    const prompt = this.buildPrompt(name, content);

    if (!this.client) {
      throw new Error('Gemini não configurado: defina GEMINI_API_KEY.');
    }

    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction:
        'Você é um especialista em documentação técnica. Responda SEMPRE com um ÚNICO OBJETO JSON válido contendo as chaves: score, summary, suggestions. Não use cercas de código.',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            summary: { type: SchemaType.STRING },
            suggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          required: ['score', 'summary', 'suggestions'],
        } as any,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    // Passei instruções numa primeira mensagem e o documento na segunda (ajuda o modelo a manter o foco no contrato)
    const req = {
      contents: [
        { role: 'user', parts: [{ text: this.buildPrompt('N/A', '') }] },
        { role: 'user', parts: [{ text: prompt }] },
      ],
    } as any;

    const result = await model.generateContent(req);
    const text = result?.response?.text?.() ?? '';

    if (process.env.DEBUG_DOCS === '1') {
      this.logger.debug(`[Gemini] raw head: ${String(text).slice(0, 400)}`);
    }

    const json = this.extractJson(text);
    return this.normalizeParsed(json);
  }

  //   API pública
  async analyzeText(name: string, content: string | null): Promise<DocAnalysis> {
    // Regra LICENSE binária
    if (this.isLicense(name)) {
      if (content === null) {
        return {
          name, exists: false, score: 0, summary: '',
          suggestions: ['Adicionar um arquivo LICENSE para garantir a clareza legal e proteger o projeto e seus usuários.'],
         // content_evidence: { non_empty: false, length: 0, sha256: '' },
        };
      }
      const normalized = this.normalizeNewlines(content);
      const trimmed = normalized.trim();
      const evidence = {
        non_empty: trimmed.length > 0,
        length: normalized.length,
        sha256: trimmed.length > 0 ? this.sha256Hex(normalized) : '',
      };
      return {
        name, exists: true, score: 100,
        summary: 'Define os termos legais, permissões e limitações sob os quais o software pode ser usado, modificado e distribuído.',
        suggestions: ['Documento OK.'],
       // content_evidence: evidence,
      };
    }

    // Não existe
    if (content === null) {
      return {
        name, exists: false, score: 0, summary: '',
        suggestions: ['Sugerir adicionar este documento ao repositório atendendo às boas práticas de escrita técnica.'],
       // content_evidence: { non_empty: false, length: 0, sha256: '' },
      };
    }

    const normalized = this.normalizeNewlines(content);
    const trimmed = normalized.trim();
    const evidence = {
      non_empty: trimmed.length > 0,
      length: normalized.length,
      sha256: trimmed.length > 0 ? this.sha256Hex(normalized) : '',
    };

    // Existe mas vazio
    if (!evidence.non_empty) {
      return {
        name, exists: true, score: 0,
        summary: 'O arquivo existe, porém está vazio ou contém conteúdo mínimo.',
        suggestions: [
          'Adicionar uma visão geral clara do documento e seu objetivo',
          'Incluir seções essenciais conforme o tipo do documento',
          'Fornecer exemplos práticos e links úteis quando aplicável',
        ],
       // content_evidence: evidence,
      };
    }

    // Existe e não vazio - chamar LLM
    let llm;
    try {
      llm = await this.analyzeWithGemini(name, normalized);
    } catch (e: any) {
      if (process.env.DEBUG_DOCS === '1') {
        this.logger.warn(`[LLM ERROR] ${e?.message || e}`);
      }
      return {
        name, exists: true, score: 20,
        summary: 'Documento presente; a análise automática falhou. Recomenda-se revisão manual das seções essenciais.',
        suggestions: [
          'Adicionar/confirmar seção de objetivos/escopo',
          'Incluir instruções de instalação/uso (se aplicável)',
          'Referenciar licença e diretrizes de contribuição',
        ],
       // content_evidence: evidence,
      };
    }

    // Pós-processamento
    let { score, summary, suggestions } = llm;
    if (score === 100) {
      suggestions = ['Documento OK.'];
    } else if (!suggestions || suggestions.length === 0) {
      suggestions = [
        'Adicionar seção de objetivos/escopo',
        'Incluir instruções de instalação e uso',
        'Referenciar licença e diretrizes de contribuição',
      ];
    }

    return {
      name, exists: true, score,
      summary: summary || 'Documento presente; resumo ausente.',
      suggestions,
     // content_evidence: evidence,
    };
  }

  async analyzeMany(docs: { name: string; content: string | null }[]) {
    return Promise.all(docs.map(d => this.analyzeText(d.name, d.content)));
  }
}