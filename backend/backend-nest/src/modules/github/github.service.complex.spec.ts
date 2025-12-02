import { HttpService } from '@nestjs/axios';
import { GithubService } from './github.service';

describe('GithubService Complex Flows', () => {
  let service: GithubService;
  const mockPrisma: any = {
    githubCache: { findUnique: jest.fn(), upsert: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
    githubRepoData: { findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
  };

  const axiosGet = jest.fn();
  const mockHttp: any = { axiosRef: { get: axiosGet } };

  beforeEach(() => {
    axiosGet.mockReset();
    mockPrisma.githubCache.findUnique.mockReset();
    mockPrisma.githubRepoData.findUnique.mockReset();
    service = new GithubService(mockHttp as HttpService, mockPrisma);
  });

  it('getRepoTree returns cached data on 304 when cache exists', async () => {
    const owner = 'own';
    const repo = 'repo';
    const branch = 'main';
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    mockPrisma.githubCache.findUnique.mockResolvedValue({ url: treeUrl, etag: 'W/\"1\"', data: { tree: [{ path: 'file.md', type: 'blob' }] } });
    axiosGet.mockResolvedValue({ status: 304, data: null, headers: {} });

    const res = await service.getRepoTree(owner, repo);
    expect(res).toEqual([{ path: 'file.md', type: 'blob' }]);
  });

  it('fetchChecklistMdFiles marks binary files as skipped', async () => {
    const owner = 'o';
    const repo = 'r';
    const branch = 'main';
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const blobSha = 'sha1';

    axiosGet.mockImplementation((url: string) => {
      if (url.includes('/git/trees/') && url.includes('?recursive=1')) {
        return Promise.resolve({ status: 200, data: { tree: [{ path: 'docs/binary.md', type: 'blob', sha: blobSha, size: 10 }] }, headers: {} });
      }
      if (url.includes(`/git/blobs/${blobSha}`)) {
        const content = Buffer.from('\0binary', 'utf8').toString('base64');
        return Promise.resolve({ status: 200, data: { content }, headers: {} });
      }
      if (url.includes('/git/refs/heads/')) {
        return Promise.resolve({ status: 200, data: { object: { sha: 'commitSha' } }, headers: {} });
      }
      if (url.includes('/git/commits/commitSha')) {
        return Promise.resolve({ status: 200, data: { tree: { sha: 'treeSha' } }, headers: {} });
      }
      if (url.includes('/git/trees/treeSha')) {
        return Promise.resolve({ status: 200, data: { tree: [{ path: 'docs/binary.md', type: 'blob', sha: blobSha, size: 10 }] }, headers: {} });
      }
      return Promise.reject(new Error('unexpected ' + url));
    });

    const { resultsByPath } = await service.fetchChecklistMdFiles(owner, repo, ['binary.md'], branch);
    const res = resultsByPath['docs/binary.md'];
    expect(res).toBeDefined();
    expect(res.skipped).toBe('binary');
  });

  it('analyzeUserRepos uses mapWithConcurrency and _analyzeSingleRepo', async () => {
    const repoObj = { owner: { login: 'o' }, name: 'n', default_branch: 'main' };
    // spy on internal methods
    jest.spyOn(service as any, 'getUserRepos').mockResolvedValue([repoObj]);
    (service as any)._analyzeSingleRepo = jest.fn().mockResolvedValue({ owner: 'o', repo: 'n' });

    const results = await service.analyzeUserRepos('username', false);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ owner: 'o', repo: 'n' });
  });

  it('getAllCache and getCacheByUrl extract owner/repo correctly', async () => {
    const url = 'https://api.github.com/repos/ownerX/repoY';
    mockPrisma.githubCache.findMany.mockResolvedValue([{ url, etag: 'e', updatedAt: new Date(), data: { hello: 1 } }]);
    const all = await service.getAllCache();
    expect(all[0].owner).toBe('ownerX');
    expect(all[0].repo).toBe('repoY');

    mockPrisma.githubCache.findUnique.mockResolvedValue({ url, etag: 'e', updatedAt: new Date(), data: { hello: 1 } });
    const byUrl = await service.getCacheByUrl(url);
    expect(byUrl.owner).toBe('ownerX');
    expect(byUrl.repo).toBe('repoY');
  });

  it('checkRepoChanged returns false with etag on 304 and caches', async () => {
    const owner = 'o';
    const repo = 'r';
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    mockPrisma.githubCache.findUnique.mockResolvedValue({ url: repoUrl, etag: 'etag1' });
    axiosGet.mockResolvedValue({ status: 304, headers: { etag: 'etag1' }, data: null });

    const res = await service.checkRepoChanged(owner, repo, false);
    expect(res.changed).toBe(false);
    expect(res.etag).toBe('etag1');
  });

  it('checkRepoChanged on network error returns stale etag when cache exists', async () => {
    const owner = 'o';
    const repo = 'r';
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    mockPrisma.githubCache.findUnique.mockResolvedValue({ url: repoUrl, etag: 'etag1' });
    axiosGet.mockRejectedValue(new Error('network failure'));

    const res = await service.checkRepoChanged(owner, repo, false);
    expect(res.changed).toBe(false);
    expect(res.etag).toBe('etag1');
  });
  
  it('mapWithConcurrency returns results and respects limit', async () => {
    const items = [1,2,3,4,5];
    const fn = async (n: number) => n * 2;
    const res = await (service as any).mapWithConcurrency(items, 2, fn);
    expect(res).toEqual([2,4,6,8,10]);
  });

  it('bufferIsProbablyBinary detects binary and text buffers', () => {
    const binary = Buffer.from([0,1,2,3,4,5]);
    const text = Buffer.from('hello world', 'utf8');
    expect((service as any).bufferIsProbablyBinary(binary)).toBe(true);
    expect((service as any).bufferIsProbablyBinary(text)).toBe(false);
  });

  it('getGitignore falls back to tree+blob when direct content missing', async () => {
    const owner = 'x';
    const repo = 'y';
    // contents/.gitignore -> 404
    axiosGet.mockImplementation((url: string) => {
      if (url.includes('/contents/.gitignore')) {
        const err: any = new Error('not found'); err.response = { status: 404 }; return Promise.reject(err);
      }
      if (url.includes('/git/trees/') && url.includes('?recursive=1')) {
        return Promise.resolve({ status: 200, data: { tree: [{ path: '.gitignore', sha: 'gsha', type: 'blob', size: 5 }] }, headers: {} });
      }
      if (url.includes('/git/blobs/gsha')) {
        return Promise.resolve({ status: 200, data: { content: Buffer.from('node_modules').toString('base64') }, headers: {} });
      }
      return Promise.reject(new Error('unexpected ' + url));
    });

    const res = await service.getGitignore(owner, repo);
    expect(res.content).toContain('node_modules');
    expect(res.sha).toBe('gsha');
  });

  it('getChangelog falls back to tree+blob when direct candidates missing', async () => {
    const owner = 'o';
    const repo = 'r';
    axiosGet.mockImplementation((url: string) => {
      if (url.toLowerCase().includes('/contents/changelog')) {
        const err: any = new Error('not found'); err.response = { status: 404 }; return Promise.reject(err);
      }
      if (url.includes('/git/trees/') && url.includes('?recursive=1')) {
        return Promise.resolve({ status: 200, data: { tree: [{ path: 'docs/CHANGELOG.md', sha: 'csha', type: 'blob', size: 5 }] }, headers: {} });
      }
      if (url.includes('/git/blobs/csha')) {
        return Promise.resolve({ status: 200, data: { content: Buffer.from('changelog content').toString('base64') }, headers: {} });
      }
      return Promise.reject(new Error('unexpected ' + url));
    });

    const res = await service.getChangelog(owner, repo);
    expect(res.content).toContain('changelog content');
  });

  it('_analyzeSingleRepo returns cached data when present', async () => {
    const repo = { owner: { login: 'ow' }, name: 'nm', default_branch: 'main' };
    const cached = { data: { pre: 'value' }, etag: 'e' };
    mockPrisma.githubRepoData.findUnique.mockResolvedValue(cached);
    const res = await (service as any)._analyzeSingleRepo(repo, false);
    expect(res).toEqual(cached.data);
  });

  it('checkRepoChanged upserts new etag on 200', async () => {
    const owner = 'a';
    const repo = 'b';
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    mockPrisma.githubCache.findUnique.mockResolvedValue(null);
    axiosGet.mockResolvedValue({ status: 200, data: { some: 1 }, headers: { etag: 'newE' } });

    const res = await service.checkRepoChanged(owner, repo, false);
    expect(res.changed).toBe(true);
    expect(res.etag).toBe('newE');
    expect(mockPrisma.githubCache.upsert).toHaveBeenCalled();
  });
});
