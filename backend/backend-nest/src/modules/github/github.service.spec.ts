import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GithubService } from './github.service';
import { AxiosResponse } from 'axios';
import { Buffer } from 'buffer';
import path from 'path';

const mockAxiosResponse = (data: any, status: number, headers: any = {}): AxiosResponse<any> => ({
  data,
  status,
  statusText: status.toString(),
  headers,
  config: {} as any,
});

const mockHttpService = {
  axiosRef: {
    get: jest.fn(),
  },
};

const mockPrismaService = {
  githubCache: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  githubRepoData: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockLogger = {
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

process.env.GITHUB_TOKEN = 'test-token';
process.env.GH_MAX_BYTES = '500';
process.env.GH_CONCURRENCY = '2';
process.env.GEMINI_API_KEY = 'MOCK_TEST_GEMINI_KEY_0123456789';

describe('GithubService', () => {
  let service: GithubService;
  let httpService: HttpService;
  let prismaService: PrismaService;
  let mockFetchBranch: jest.SpyInstance;
  let mockFetchChecklist: jest.SpyInstance;
  let bufferIsProbablyBinarySpy: jest.SpyInstance;
  let extractOwnerSpy: jest.SpyInstance;
  let extractRepoSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
    httpService = module.get<HttpService>(HttpService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();

    mockFetchBranch = jest.spyOn(service as any, '_fetchDefaultBranch').mockResolvedValue('main');
    mockFetchChecklist = jest.spyOn(service as any, 'fetchChecklistMdFiles');
    bufferIsProbablyBinarySpy = jest.spyOn(service as any, 'bufferIsProbablyBinary');
    extractOwnerSpy = jest.spyOn(service as any, 'extractOwner');
    extractRepoSpy = jest.spyOn(service as any, 'extractRepo');
  });

  afterAll(() => {
    mockFetchBranch.mockRestore();
    mockFetchChecklist.mockRestore();
    bufferIsProbablyBinarySpy.mockRestore();
    extractOwnerSpy.mockRestore();
    extractRepoSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- TESTES DE MÉTODOS PRIVADOS ---

  describe('defaultHeaders (Private)', () => {
    it('deve retornar headers com Authorization', () => {
      const headers = (service as any).defaultHeaders();
      expect(headers).toHaveProperty('Authorization', 'Bearer test-token');
    });
  });

  describe('decodeBase64 (Private)', () => {
    it('deve decodificar conteúdo', () => {
      const encoded = Buffer.from('conteúdo de teste').toString('base64');
      expect((service as any).decodeBase64(encoded)).toBe('conteúdo de teste');
    });
    it('deve retornar null para conteúdo undefined', () => {
      expect((service as any).decodeBase64(undefined)).toBeNull();
    });
  });

  describe('bufferIsProbablyBinary (Private)', () => {
    it('deve retornar true se contiver o byte nulo (0)', () => {
      const binaryBuffer = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
      expect((service as any).bufferIsProbablyBinary(binaryBuffer)).toBe(true);
    });
    it('deve retornar false para texto ASCII', () => {
      const textBuffer = Buffer.from('Hello world, this is a test.');
      expect((service as any).bufferIsProbablyBinary(textBuffer)).toBe(false);
    });
  });

  describe('mapWithConcurrency (Private)', () => {
    it('deve executar todas as tarefas respeitando o limite', async () => {
      const items = [1, 2, 3, 4];
      const limit = 2;
      const mockFn = jest.fn(async (item) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 2;
      });
      const results = await (service as any).mapWithConcurrency(items, limit, mockFn);
      expect(results.sort()).toEqual([2, 4, 6, 8]);
      expect(mockFn).toHaveBeenCalledTimes(4);
    });
  });

  describe('httpGet (Private)', () => {
    const url = 'https://api.github.com/test';

    it('deve buscar sem cache e salvar se o status for 200', async () => {
      mockPrismaService.githubCache.findUnique.mockResolvedValue(null);
      mockHttpService.axiosRef.get.mockResolvedValue(mockAxiosResponse({ data: 'new' }, 200, { etag: 'new-etag' }));
      const response = await (service as any).httpGet(url);
      expect(mockPrismaService.githubCache.upsert).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('deve usar o cache se o status for 304', async () => {
      const cachedData = { url, etag: 'old-etag', data: { data: 'cached' } };
      mockPrismaService.githubCache.findUnique.mockResolvedValue(cachedData);
      mockHttpService.axiosRef.get.mockResolvedValue(mockAxiosResponse(null, 304, { etag: 'old-etag' }));
      const response = await (service as any).httpGet(url);
      expect(response.data.data).toBe('cached');
      expect(response.status).toBe(200);
      expect(mockPrismaService.githubCache.upsert).not.toHaveBeenCalled();
    });

    it('deve retornar cache "stale" em caso de falha de API, se houver cache', async () => {
      const cachedData = { url, etag: 'old-etag', data: { data: 'stale-cache' } };
      mockPrismaService.githubCache.findUnique.mockResolvedValue(cachedData);
      mockHttpService.axiosRef.get.mockRejectedValue({ message: 'Network Error', response: { status: 500 } });
      const response = await (service as any).httpGet(url);
      expect(response.data.data).toBe('stale-cache');
      expect(response.headers['x-cache-status']).toBe('stale');
    });

    it('deve lançar erro se falhar e não houver cache', async () => {
      mockPrismaService.githubCache.findUnique.mockResolvedValue(null);
      const error = { message: 'Not Found', response: { status: 404 } };
      mockHttpService.axiosRef.get.mockRejectedValue(error);
      await expect((service as any).httpGet(url)).rejects.toEqual({
        status: 404,
        message: 'Not Found',
        original: error
      });
    });
  });

  // --- TESTES DE MÉTODOS PÚBLICOS ---

  describe('getUserRepos', () => {
    const username = 'testuser';
    it('deve retornar repositórios com contadores', async () => {
      // Mock da resposta da API do GitHub com campos novos
      const reposPage1 = [
        { 
            name: `repo1`, 
            owner: { login: 'testuser' }, 
            html_url: `url1`, 
            private: false, 
            default_branch: 'main',
            stargazers_count: 10,
            watchers_count: 5,
            open_issues_count: 2,
            forks_count: 1
        }
      ];
      
      jest.spyOn(service as any, 'httpGet').mockResolvedValueOnce(mockAxiosResponse(reposPage1, 200));
      
      const result = await service.getUserRepos(username);
      expect(result.length).toBe(1);
      expect((result[0] as any).stargazers_count).toBe(10);
      expect((result[0] as any).watchers_count).toBe(5);
    });
  });

  // --- NOVOS MÉTODOS ADICIONADOS ---

  describe('getBranches', () => {
    it('deve retornar lista de nomes de branches', async () => {
      const branches = [{ name: 'main' }, { name: 'dev' }];
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse(branches, 200));
      const result = await service.getBranches('o', 'r');
      expect(result).toEqual(['main', 'dev']);
    });
  });

  describe('getPullRequests', () => {
    it('deve retornar lista simplificada de PRs', async () => {
      const prs = [{ number: 1, title: 'Fix', state: 'open', user: { login: 'u' } }];
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse(prs, 200));
      const result = await service.getPullRequests('o', 'r');
      expect(result[0].title).toBe('Fix');
    });
  });

  describe('getContributors', () => {
    it('deve retornar lista de contribuidores', async () => {
      const contribs = [{ login: 'dev', contributions: 10 }];
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse(contribs, 200));
      const result = await service.getContributors('o', 'r');
      expect(result[0].login).toBe('dev');
    });
  });

  // --- TESTES ANTIGOS ---

  describe('getCommits', () => {
    it('deve retornar mensagens de commit', async () => {
      const commits = [{ commit: { message: 'feat: new' } }];
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse(commits, 200));
      const result = await service.getCommits('o', 'r');
      expect(result).toEqual(['feat: new']);
    });
  });

  describe('getIssues', () => {
    it('deve retornar apenas issues (filtrando PRs)', async () => {
      const data = [{ number: 1, pull_request: {} }, { number: 2, pull_request: undefined, title: 'Issue' }];
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse(data, 200));
      const result = await service.getIssues('o', 'r');
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Issue');
    });
  });

  describe('getReleases', () => {
    it('deve retornar releases formatadas', async () => {
      const data = [{ name: 'v1.0', tag_name: 'v1.0.0' }];
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse(data, 200));
      const result = await service.getReleases('o', 'r');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('v1.0');
    });
  });

  describe('getReadme', () => {
    it('deve retornar conteúdo decodificado', async () => {
      const content = 'README content';
      const encoded = Buffer.from(content).toString('base64');
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse({ content: encoded, path: 'README.md' }, 200));
      const result = await service.getReadme('o', 'r');
      expect(result.content).toBe(content);
    });

    it('deve retornar conteúdo nulo em caso de erro 404', async () => {
      jest.spyOn(service as any, 'httpGet').mockRejectedValue({ status: 404 });
      const result = await service.getReadme('o', 'r');
      expect(result).toEqual({ name: 'README.md', path: 'README.md', content: null });
    });
  });

  describe('getLicenses', () => {
    it('deve retornar detalhes da licença API', async () => {
      const data = { license: { name: 'MIT License', spdx_id: 'MIT', key: 'mit' }, name: 'LICENSE' };
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse(data, 200));
      const result = await service.getLicenses('o', 'r');
      expect(result.name).toBe('MIT License');
    });
  });

  describe('getGitignore', () => {
    it('deve retornar conteúdo via caminho direto', async () => {
      const content = 'ignore';
      const encoded = Buffer.from(content).toString('base64');
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse({ content: encoded, path: '.gitignore' }, 200));
      const result = await service.getGitignore('o', 'r');
      expect(result.content).toBe(content);
    });

    it('deve usar fallback via tree/blobs em caso de 404', async () => {
      const content = 'fallback';
      const encoded = Buffer.from(content).toString('base64');
      jest.spyOn(service as any, 'httpGet')
        .mockRejectedValueOnce({ status: 404 })
        .mockResolvedValueOnce(mockAxiosResponse({ tree: [{ path: '.gitignore', type: 'blob', sha: 'sha1' }] }, 200))
        .mockResolvedValueOnce(mockAxiosResponse({ content: encoded }, 200));
      const result = await service.getGitignore('o', 'r');
      expect(result.content).toBe(content);
    });
  });

  describe('getChangelog', () => {
    it('deve retornar conteúdo do primeiro candidato encontrado', async () => {
      const content = 'Changelog';
      const encoded = Buffer.from(content).toString('base64');
      jest.spyOn(service as any, 'httpGet')
        .mockRejectedValueOnce({ status: 404 })
        .mockResolvedValueOnce(mockAxiosResponse({ content: encoded, path: 'changelog.md' }, 200));
      const result = await service.getChangelog('o', 'r');
      expect(result.content).toBe(content);
    });
  });

  describe('getContributing', () => {
    it('deve retornar conteúdo do CONTRIBUTING.md', async () => {
      const content = 'Contribute';
      const encoded = Buffer.from(content).toString('base64');
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse({ content: encoded, path: 'CONTRIBUTING.md' }, 200));
      const result = await service.getContributing('o', 'r');
      expect(result.content).toBe(content);
    });
  });

  describe('getConductCode', () => {
    it('deve usar fallback para .github/CODE_OF_CONDUCT.md se o root falhar (404)', async () => {
      const content = 'Code Fallback';
      const encoded = Buffer.from(content).toString('base64');
      jest.spyOn(service as any, 'httpGet')
        .mockRejectedValueOnce({ status: 404 })
        .mockResolvedValueOnce(mockAxiosResponse({ content: encoded, path: '.github/CODE_OF_CONDUCT.md' }, 200));
      const result = await service.getConductCode('o', 'r');
      expect(result.content).toBe(content);
    });
  });

  describe('getDocs', () => {
    it('deve usar fallback para /docs/ se /Docs/ falhar (404)', async () => {
      const fallbackData = [{ type: 'file', name: 'file.md', path: 'docs/file.md', download_url: 'url' }];
      jest.spyOn(service as any, 'httpGet')
        .mockRejectedValueOnce({ status: 404 })
        .mockResolvedValueOnce(mockAxiosResponse(fallbackData, 200));
      const result = await service.getDocs('o', 'r');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('file.md');
    });
  });

  describe('getDocsContent', () => {
    it('deve retornar conteúdo de todos os documentos', async () => {
      jest.spyOn(service as any, 'getDocs').mockResolvedValue([{ name: 'd1', download_url: 'u1' }, { name: 'd2', download_url: 'u2' }]);
      jest.spyOn(service as any, 'httpGet')
        .mockResolvedValueOnce(mockAxiosResponse('Content 1', 200))
        .mockResolvedValueOnce(mockAxiosResponse('Content 2', 200));
      const result = await service.getDocsContent('o', 'r');
      expect(result[0].content).toBe('Content 1');
    });

    it('deve lidar com falhas de download', async () => {
      jest.spyOn(service as any, 'getDocs').mockResolvedValue([{ name: 'd1', download_url: 'u1' }]);
      jest.spyOn(service as any, 'httpGet').mockRejectedValueOnce({ message: 'Error' });
      const result = await service.getDocsContent('o', 'r');
      expect(result[0].content).toBeNull();
    });
  });

  describe('getRepoTree', () => {
    it('deve retornar a estrutura da árvore do repositório', async () => {
      const treeData = [{ path: 'src/file.ts', type: 'blob' }];
      jest.spyOn(service as any, 'httpGet').mockResolvedValue(mockAxiosResponse({ tree: treeData }, 200));
      const result = await service.getRepoTree('o', 'r');
      expect(result.length).toBe(1);
    });
  });

  describe('getGovernance, getArchitecture, getRoadmap', () => {
    it('getGovernance deve usar fetchChecklistMdFiles com o padrão correto', async () => {
      mockFetchChecklist.mockResolvedValue({
        resultsByPath: { 'governance.md': { path: 'governance.md', content: 'Gov' } },
        summary: {},
        patternResults: {}
      });
      const result = await service.getGovernance('o', 'r');
      expect(mockFetchChecklist).toHaveBeenCalledWith('o', 'r', ['governance.md'], 'main');
      expect(result.content).toBe('Gov');
    });
  });

  describe('fetchChecklistMdFiles', () => {
    it('deve buscar e processar arquivos Md correspondentes', async () => {
      const tree = [
        { path: 'README.md', type: 'blob', sha: 'sha1', size: 100 },
        { path: 'TOO_LARGE.md', type: 'blob', sha: 'sha5', size: 600 },
      ];
      jest.spyOn(service as any, 'httpGet')
        .mockResolvedValueOnce(mockAxiosResponse({ tree }, 200))
        .mockResolvedValueOnce(mockAxiosResponse({ content: Buffer.from('Content 1').toString('base64') }, 200));

      const result = await (service as any).fetchChecklistMdFiles('o', 'r', ['README.md', 'TOO_LARGE.md'], 'main');

      expect(result.summary.fetched).toBe(1);
      expect(result.resultsByPath['README.md'].content).toBe('Content 1');
      expect(result.resultsByPath['TOO_LARGE.md'].skipped).toBe('too_large');
    });
  });

  describe('getFormattedCachedRepos', () => {
    it('deve retornar dados de repositórios formatados', async () => {
      const mockData = [{ data: { nomeRepositorio: 'Repo1', commits: 5 } }];
      mockPrismaService.githubRepoData.findMany.mockResolvedValue(mockData);
      const result = await service.getFormattedCachedRepos();
      expect((result[0] as any).nomeRepositorio).toBe('Repo1');
    });
  });

  describe('formatRepoData', () => {
    it('deve formatar corretamente dados com métricas e sem booleanos', () => {
      const inputData = [{
        repo: 'test-repo',
        commits: ['c1', 'c2'], 
        branches: ['b1', 'b2'], // Novo
        pullRequests: [{}],     // Novo
        contributors: [{}],     // Novo
        stargazers_count: 10,
        watchers_count: 5,
        open_issues_count: 2,
        forks_count: 1,
        
        issues: [{}], releases: [{}],
        license: { name: 'MIT', key: 'mit' }, gitignore: { content: 'ignore' },
        docsContent: [{ name: 'README.md', content: 'R' }],
        checkFolders: []
      }];
      
      const result = service.formatRepoData(inputData)[0];
      
      // Verifica se as métricas foram populadas
      expect((result as any).commits).toBe(2);
      expect((result as any).branches_count).toBe(2);
      expect((result as any).prs_count).toBe(1);
      expect((result as any).stargazers_count).toBe(10);
      expect((result as any).watchers_count).toBe(5);
      
      // Verifica se os booleanos antigos foram removidos (agora são undefined)
      expect((result as any).possuiLicense).toBeUndefined();
      
      // Verifica se detalhes foram populados
      expect((result as any).detalhes.license).toBe('MIT');
    });
  });

  describe('checkRepoChanged', () => {
    it('deve retornar changed: false se status for 304', async () => {
      const cached = { url: 'u', etag: 'e', data: {} };
      mockPrismaService.githubCache.findUnique.mockResolvedValue(cached);
      mockHttpService.axiosRef.get.mockResolvedValue(mockAxiosResponse(null, 304, { etag: 'e' }));
      const result = await service.checkRepoChanged('o', 'r');
      expect(result).toEqual({ changed: false, etag: 'e' });
    });
  });

  describe('_analyzeSingleRepo (Private)', () => {
    it('deve retornar cache HIT se não houver mudança e etag coincidir', async () => {
      // Objeto completo mockado
      const repo = { 
          owner: { login: 'o' }, 
          name: 'r', 
          default_branch: 'main', 
          url: 'u', 
          private: false,
          stargazers_count: 0,
          watchers_count: 0,
          open_issues_count: 0,
          forks_count: 0
      };
      
      jest.spyOn(service, 'checkRepoChanged').mockResolvedValue({ changed: false, etag: 'e1' });
      mockPrismaService.githubRepoData.findUnique.mockResolvedValue({ etag: 'e1', data: { hit: true } });
      
      // Testando com forceUpdate = false
      const result = await (service as any)._analyzeSingleRepo(repo, false);
      expect(result).toEqual({ hit: true });
    });
  });

  describe('analyzeUserRepos', () => {
    it('deve analisar repos e corrigir IDs', async () => {
      // Array completo mockado
      const repos = [
          { owner: { login: 'o' }, name: 'r1', default_branch: 'main', url: 'u1', private: false, stargazers_count: 0, watchers_count: 0, open_issues_count: 0, forks_count: 0 }, 
          { owner: { login: 'o' }, name: 'r2', default_branch: 'main', url: 'u2', private: false, stargazers_count: 0, watchers_count: 0, open_issues_count: 0, forks_count: 0 }
      ];
      
      jest.spyOn(service, 'getUserRepos').mockResolvedValue(repos);
      jest.spyOn(service as any, '_analyzeSingleRepo').mockResolvedValueOnce({ repo: 'r1' }).mockResolvedValueOnce({ repo: 'r2' });
      
      const result = await service.analyzeUserRepos('user', false);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1); // ID corrigido
      expect(result[1].id).toBe(2); // ID corrigido
    });
  });

  describe('getAllCache', () => {
    it('deve retornar todos os itens de cache formatados', async () => {
      const mockResults = [{ url: 'https://api.github.com/repos/o1/r1', updatedAt: new Date(), data: { d: 1 } }];
      mockPrismaService.githubCache.findMany.mockResolvedValue(mockResults);
      extractOwnerSpy.mockReturnValue('o1');
      extractRepoSpy.mockReturnValue('r1');
      const result = await service.getAllCache();
      expect(result[0].owner).toBe('o1');
    });
  });

  describe('getCacheByUrl', () => {
    it('deve lançar NotFoundException se o cache não for encontrado', async () => {
      mockPrismaService.githubCache.findUnique.mockResolvedValue(null);
      await expect(service.getCacheByUrl('url')).rejects.toThrow(NotFoundException);
    });
  });

  describe('extractOwner / extractRepo (Private)', () => {
    it('deve extrair de URLs de API de repositório', () => {
      const repoUrl = 'https://api.github.com/repos/owner-test/repo-test/contents/file.md';
      expect((service as any).extractOwner(repoUrl)).toBe('owner-test');
      expect((service as any).extractRepo(repoUrl)).toBe('repo-test');
    });
  });
});