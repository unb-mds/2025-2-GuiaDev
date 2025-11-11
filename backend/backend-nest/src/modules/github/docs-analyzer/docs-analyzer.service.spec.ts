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
    return service.analyzeText('README.md', null).then(result => {
      expect(result.exists).toBe(false);
      expect(result.score).toBe(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  it('analyzes short README', () => {
    const content = '# Meu Projeto\n\nREADME curto.';
    return service.analyzeText('README.md', content).then(result => {
      expect(result.exists).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
