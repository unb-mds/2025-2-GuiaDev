import { Test, TestingModule } from '@nestjs/testing';
import { DocsAnalyzerService } from './docs-analyzer.service';
import { SchemaType, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

//  Mocks Globais para a biblioteca do Google
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    // Precisamos exportar os Enums que o Service usa, senão dá erro de undefined
    SchemaType: { OBJECT: 'OBJECT', NUMBER: 'NUMBER', STRING: 'STRING', ARRAY: 'ARRAY' },
    HarmCategory: { 
      HARM_CATEGORY_HATE_SPEECH: 'HATE',
      HARM_CATEGORY_HARASSMENT: 'HARASS',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'SEXUAL',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'DANGEROUS'
    },
    HarmBlockThreshold: { BLOCK_NONE: 'NONE' },
  };
});

describe('DocsAnalyzerService', () => {
  let service: DocsAnalyzerService;

  // Variáveis de ambiente originais para restaurar depois
  const originalEnv = process.env;

  beforeEach(async () => {
    // Configura API Key fake para garantir que o construtor inicie o client
    process.env = { ...originalEnv, GEMINI_API_KEY: 'fake-key' };
    jest.clearAllMocks();

    // Configura o retorno padrão do getGenerativeModel
    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [DocsAnalyzerService],
    }).compile();

    service = module.get<DocsAnalyzerService>(DocsAnalyzerService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Lógica de Arquivos Específicos (LICENSE)', () => {
    it('deve retornar score 100 se for um arquivo LICENSE com conteúdo', async () => {
      const result = await service.analyzeText('LICENSE', 'MIT License...');
      
      expect(result.score).toBe(100);
      expect(result.exists).toBe(true);
      expect(result.suggestions).toContain('Documento OK.');
      // Garante que NÃO chamou a IA para economizar tokens
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('deve retornar score 0 e sugestão específica se LICENSE existir mas for null (não carregado)', async () => {
      const result = await service.analyzeText('LICENSE', null);
      
      expect(result.score).toBe(0);
      expect(result.exists).toBe(false);
      expect(result.suggestions[0]).toContain('Adicionar um arquivo LICENSE');
    });
  });

  describe('Validações Básicas de Conteúdo', () => {
    it('deve retornar exists:false se o conteúdo for null', async () => {
      const result = await service.analyzeText('README.md', null);
      
      expect(result.exists).toBe(false);
      expect(result.score).toBe(0);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('deve retornar score 0 se o arquivo existir mas estiver vazio (string vazia ou espaços)', async () => {
      const result = await service.analyzeText('README.md', '   \n   ');
      
      expect(result.exists).toBe(true);
      expect(result.score).toBe(0);
      expect(result.summary).toContain('vazio');
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });
  });

  describe('Análise via Gemini (LLM)', () => {
    const mockFileContent = '# Title\nSome content here.';

    it('deve processar a resposta JSON limpa do Gemini corretamente', async () => {
      // Mock da resposta da IA
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            score: 85,
            summary: 'Resumo teste',
            suggestions: ['Melhorar X', 'Melhorar Y']
          })
        }
      });

      const result = await service.analyzeText('README.md', mockFileContent);

      expect(mockGetGenerativeModel).toHaveBeenCalled();
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result.score).toBe(85);
      expect(result.summary).toBe('Resumo teste');
      expect(result.suggestions).toHaveLength(2);
    });

    it('deve limpar cercas de código (markdown) da resposta da IA antes de fazer parse', async () => {
      // A IA as vezes responde assim: ```json { ... } ```
      const dirtyJson = "```json\n" + JSON.stringify({
        score: 50,
        summary: 'Parsed correctly',
        suggestions: []
      }) + "\n```";

      mockGenerateContent.mockResolvedValue({
        response: { text: () => dirtyJson }
      });

      const result = await service.analyzeText('CONTRIBUTING.md', mockFileContent);

      expect(result.score).toBe(50);
      expect(result.summary).toBe('Parsed correctly');
    });

    it('deve lidar com falhas na API do Gemini retornando fallback (Score 20)', async () => {
      // Simula erro na API (ex: quota excedida ou timeout)
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await service.analyzeText('README.md', mockFileContent);

      expect(result.score).toBe(20);
      expect(result.summary).toContain('análise automática falhou');
      expect(result.suggestions.length).toBeGreaterThan(0); // Deve ter sugestões padrão
    });

    it('deve lidar com JSON inválido retornado pela IA retornando objeto vazio/padrão', async () => {
      // IA alucinou e não mandou JSON
      mockGenerateContent.mockResolvedValue({
        response: { text: () => "Desculpe, não posso analisar isso." }
      });

      const result = await service.analyzeText('README.md', mockFileContent);
      
      // O código converte parse falho em score 0 (via normalizeParsed -> objeto vazio)
      // Se o parse falhar totalmente, ele cai no normalizeParsed com {}
      expect(result.score).toBe(0); 
    });
    
    it('deve garantir que score 100 gere sugestão "Documento OK."', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({ score: 100, summary: 'Perfeito', suggestions: [] })
        }
      });

      const result = await service.analyzeText('README.md', mockFileContent);
      expect(result.suggestions).toEqual(['Documento OK.']);
    });
  });

  describe('analyzeMany', () => {
    it('deve analisar múltiplos arquivos em paralelo', async () => {
        const files = [
            { name: 'LICENSE', content: 'MIT...' },
            { name: 'README.md', content: 'Conteúdo' }
        ];

        // Configura mock para o README (o LICENSE não chama o mock)
        mockGenerateContent.mockResolvedValue({
            response: { text: () => JSON.stringify({ score: 50, summary: 'S', suggestions: [] }) }
        });

        const results = await service.analyzeMany(files);

        expect(results).toHaveLength(2);
        expect(results[0].name).toBe('LICENSE');
        expect(results[0].score).toBe(100); 
        expect(results[1].name).toBe('README.md');
        expect(results[1].score).toBe(50); 
    });
  });
});