import { DocsAnalyzerService } from './docs-analyzer.service';

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn(() => ({
        generateContent: jest.fn(async (req: any) => ({
          response: {
            text: () => '{"score":85,"summary":"OK","suggestions":["A","B"]}',
          },
        })),
      })),
    })),
    SchemaType: {
      OBJECT: 'object',
      NUMBER: 'number',
      STRING: 'string',
      ARRAY: 'array',
    },
    HarmCategory: {
      HARM_CATEGORY_HATE_SPEECH: 0,
      HARM_CATEGORY_HARASSMENT: 1,
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 2,
      HARM_CATEGORY_DANGEROUS_CONTENT: 3,
    },
    HarmBlockThreshold: { BLOCK_NONE: 0 },
  };
});

describe('DocsAnalyzerService', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('should return license missing suggestion when LICENSE not present', async () => {
    const svc = new DocsAnalyzerService();
    const res = await svc.analyzeText('LICENSE', null);
    expect(res.exists).toBe(false);
    expect(res.suggestions[0]).toMatch(/Adicionar um arquivo LICENSE/);
  });

  it('should return license OK when LICENSE present', async () => {
    const svc = new DocsAnalyzerService();
    const res = await svc.analyzeText('LICENSE', 'MIT license content');
    expect(res.exists).toBe(true);
    expect(res.score).toBe(100);
    expect(res.suggestions).toEqual(['Documento OK.']);
  });

  it('should handle missing non-license document', async () => {
    const svc = new DocsAnalyzerService();
    const res = await svc.analyzeText('README.md', null);
    expect(res.exists).toBe(false);
    expect(res.score).toBe(0);
  });

  it('should handle empty content', async () => {
    const svc = new DocsAnalyzerService();
    const res = await svc.analyzeText('README.md', '\n\n  \n');
    expect(res.exists).toBe(true);
    expect(res.score).toBe(0);
    expect(res.summary).toMatch(/vazio/);
  });

  it('should call Gemini and parse result', async () => {
    const svc = new DocsAnalyzerService();
    const res = await svc.analyzeText(
      'README.md',
      'This is some content for testing.',
    );
    expect(res.exists).toBe(true);
    expect(res.score).toBe(85);
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it('should fallback when Gemini throws', async () => {
    // mock to throw
    const mod = require('@google/generative-ai');
    mod.GoogleGenerativeAI = jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn(() => ({
        generateContent: jest.fn(async () => {
          throw new Error('LLM fail');
        }),
      })),
    }));

    process.env.GEMINI_API_KEY = 'test-key';
    const svc = new DocsAnalyzerService();
    const res = await svc.analyzeText('DOC.md', 'Non-empty content');
    expect(res.score).toBe(20);
    expect(res.suggestions.length).toBeGreaterThan(0);
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { DocsAnalyzerService } from './docs-analyzer.service';

describe('DocsAnalyzerService', () => {
  let service: DocsAnalyzerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocsAnalyzerService],
    }).compile();

    service = module.get<DocsAnalyzerService>(DocsAnalyzerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('analyzes missing doc', () => {
    return service.analyzeText('README.md', null).then((result) => {
      expect(result.exists).toBe(false);
      expect(result.score).toBe(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  it('analyzes short README', () => {
    const content = '# Meu Projeto\n\nREADME curto.';
    return service.analyzeText('README.md', content).then((result) => {
      expect(result.exists).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
