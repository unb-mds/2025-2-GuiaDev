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
    bufferIsProbablyBinarySpy = jest.spyOn(service as any, 'bufferIsProbablyBinary').mockReturnValue(false);
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

  describe('defaultHeaders (Private)', () => {
    it('deve retornar headers com Authorization', () => {
      const headers = (service as any).defaultHeaders();
      expect(headers).toHaveProperty('Authorization', 'Bearer test-token');
    });
  });

  describe('decodeBase64 (Private)', () => {
    const decodeBase64 = (service as any).decodeBase64.bind(service);
    it('deve decodificar conteúdo', () => {
      const encoded = Buffer.from('conteúdo de teste').toString('base64');
      expect(decodeBase64(encoded)).toBe('conteúdo de teste');
    });
    it('deve retornar null para conteúdo undefined', () => {
      expect(decodeBase64(undefined)).toBeNull();
    });
  });

  describe('bufferIsProbablyBinary (Private)', () => {
    const bufferIsProbablyBinary = (service as any).bufferIsProbablyBinary.bind(service);
    it('deve retornar true se contiver o byte nulo (0)', () => {
      const binaryBuffer = Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
      expect(bufferIsProbablyBinary(binaryBuffer)).toBe(true);
    });
    it('deve retornar false para texto ASCII', () => {
      const textBuffer = Buffer.from('Hello world, this is a test.');
      expect(bufferIsProbablyBinary(textBuffer)).toBe(false);
    });
  });

  describe('mapWithConcurrency (Private)', () => {
    const mapWithConcurrency = (service as any).mapWithConcurrency.bind(service);
    it('deve executar todas as tarefas respeitando o limite', async () => {
      const items = [1, 2, 3, 4];
      const limit = 2;
      const mockFn = jest.fn(async (item) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 2;
      });
      const results = await mapWithConcurrency(items, limit, mockFn);
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

  describe('_fetchDefaultBranch (Private)', () => {
    const owner = 'test-owner';
    const repo = 'test-repo';
    const _fetchDefaultBranch = (service as any)._fetchDefaultBranch.bind(service);

    it('deve retornar a branch padrão', async () => {
      mockFetchBranch.mockRestore();
      mockHttpService.axiosRef.get.mockResolvedValue(mockAxiosResponse({ default_branch: 'develop' }, 200));
      const result = await _fetchDefaultBranch(owner, repo);
      expect(result).toBe('develop');
    });

    it('deve retornar "main" em caso de erro', async () => {
      mockFetchBranch.mockRestore();
      mockHttpService.axiosRef.get.mockRejectedValue({ message: 'Not Found' });
      const result = await _fetchDefaultBranch(owner, repo);
      expect(result).toBe('main');
    });
  });

  describe('getUserRepos', () => {
    const username = 'testuser';
    it('deve retornar repositórios em múltiplas páginas', async () => {
      const reposPage1 = Array(100).fill(0).map((_, i) => ({ name: `repo${i}`, owner: { login: 'testuser' }, html_url: `url${i}`, private: false, default_branch: 'main' }));
      const reposPage2 = [{ name: 'repo100', owner: { login: 'testuser' }, html_url: 'url100', private: false, default_branch: 'main' }];
      jest.spyOn(service as any, 'httpGet')
        .mockResolvedValueOnce(mockAxiosResponse(reposPage1, 200))
        .mockResolvedValueOnce(mockAxiosResponse(reposPage2, 200));
      const result = await service.getUserRepos(username);
      expect(result.length).toBe(101);
    });

    it('deve retornar array vazio se o usuário não for encontrado (404)', async () => {
      jest.spyOn(service as any, 'httpGet').mockRejectedValue({ status: 404 });
      const result = await service.getUserRepos(username);
      expect(result).toEqual([]);
    });
  });

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

    it('getArchitecture deve priorizar arquivos com padrões corretos', async () => {
      mockFetchChecklist.mockResolvedValue({
        resultsByPath: { 'docs/architecture.md': { path: 'docs/architecture.md', content: 'Arch' } },
        summary: {},
        patternResults: {}
      });
      const result = await service.getArchitecture('o', 'r');
      expect(mockFetchChecklist).toHaveBeenCalledWith('o', 'r', ['architecture.md', 'arquitetura.md'], 'main');
      expect(result.content).toBe('Arch');
    });
  });

  describe('fetchChecklistMdFiles', () => {
    it('deve buscar e processar arquivos Md correspondentes, pulando grandes', async () => {
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
      expect(result[0].nomeRepositorio).toBe('Repo1');
    });
  });

  describe('formatRepoData', () => {
    it('deve formatar corretamente dados de repositório com todos os checks', () => {
      const inputData = [{
        repo: 'test-repo',
        commits: ['c1', 'c2'], issues: [{}], releases: [{}],
        license: { name: 'MIT', key: 'mit' }, gitignore: { content: 'ignore' },
        docsContent: [{ name: 'README.md', content: 'R' }, { name: 'code_of_conduct.md', content: 'C' }],
        checkFolders: [{ path: 'src', exists: true }, { path: 'license_file_check', exists: true }]
      }];
      const result = service.formatRepoData(inputData)[0];
      expect(result.possuiLicense).toBe(true);
      expect(result.possuiSrc).toBe(true);
      expect(result.detalhes.license).toBe('MIT');
      expect(result.commits).toBe(2);
    });

    it('deve lidar com dados ausentes ou inválidos', () => {
      const inputData = [{ repo: 'empty', commits: null, issues: [], releases: null, license: { key: 'unlicensed' }, gitignore: null, docsContent: [], checkFolders: [] }];
      const result = service.formatRepoData(inputData)[0];
      expect(result.commits).toBe(0);
      expect(result.possuiIssues).toBe(false);
      expect(result.possuiLicense).toBe(false);
      expect(result.detalhes.license).toBeNull();
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
      const repo = { owner: { login: 'o' }, name: 'r', default_branch: 'main' };
      jest.spyOn(service, 'checkRepoChanged').mockResolvedValue({ changed: false, etag: 'e1' });
      mockPrismaService.githubRepoData.findUnique.mockResolvedValue({ etag: 'e1', data: { hit: true } });
      const result = await (service as any)._analyzeSingleRepo(repo);
      expect(result).toEqual({ hit: true });
    });
  });

  describe('analyzeUserRepos', () => {
    it('deve analisar repos em concorrência', async () => {
      const repos = [{ owner: { login: 'o' }, name: 'r1', default_branch: 'main' }, { owner: { login: 'o' }, name: 'r2', default_branch: 'main' }];
      jest.spyOn(service, 'getUserRepos').mockResolvedValue(repos);
      jest.spyOn(service as any, '_analyzeSingleRepo').mockResolvedValueOnce({ repo: 'r1' }).mockResolvedValueOnce({ repo: 'r2' });
      const result = await service.analyzeUserRepos('user');
      expect(result.length).toBe(2);
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
    const extractOwner = (service as any).extractOwner.bind(service);
    const extractRepo = (service as any).extractRepo.bind(service);
    it('deve extrair de URLs de API de repositório', () => {
      const repoUrl = 'https://api.github.com/repos/owner-test/repo-test/contents/file.md';
      expect(extractOwner(repoUrl)).toBe('owner-test');
      expect(extractRepo(repoUrl)).toBe('repo-test');
    });
  });
});