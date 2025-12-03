import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Buffer } from 'buffer';
import path from 'path';
import { AxiosResponse } from 'axios';
import { PrismaService } from '../../database/prisma.service';
import { randomUUID } from 'crypto'; 

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private token = process.env.GITHUB_TOKEN;
  private readonly MAX_BYTES = Number(process.env.GH_MAX_BYTES || 200 * 1024);
  private readonly CONCURRENCY = Number(process.env.GH_CONCURRENCY || 10);

  private defaultHeaders(userToken?: string) {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    const tokenToUse = userToken || this.token;
    if (tokenToUse) headers.Authorization = `Bearer ${tokenToUse}`;
    return headers;
  }

  private decodeBase64(content?: string) {
    if (!content) return null;
    return Buffer.from(content, 'base64').toString('utf8');
  }

  private bufferIsProbablyBinary(buf: Buffer) {
    if (!buf || buf.length === 0) return false;
    if (buf.includes(0)) return true;
    const len = Math.min(buf.length, 512);
    let nonPrintable = 0;
    for (let i = 0; i < len; i++) { const b = buf[i]; if (b === 9 || b === 10 || b === 13) continue; if (b < 32 || b > 126) nonPrintable++; }
    return nonPrintable / len > 0.3;
  }

  private async mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
    const results: R[] = []; const executing: Promise<void>[] = [];
    for (const item of items) {
      const p = (async () => { results.push(await fn(item)); })();
      executing.push(p);
      if (executing.length >= limit) {
        await Promise.race(executing).catch(() => {});
        for (let i = executing.length - 1; i >= 0; i--) { try { if (await Promise.race([executing[i], Promise.resolve('pending')]) !== 'pending') executing.splice(i, 1); } catch { executing.splice(i, 1); } }
      }
    }
    await Promise.allSettled(executing); return results;
  }

  private async httpGet(url: string, headers?: Record<string, string>, timeout = 15000, userToken?: string): Promise<AxiosResponse<any>> {
    const finalHeaders = { ...this.defaultHeaders(userToken), ...(headers || {}) };

    const cachedEntry = await this.prisma.githubCache.findUnique({ 
      where: { url } 
    });

    if (cachedEntry && cachedEntry.etag) {
      if (!finalHeaders['If-None-Match']) {
          finalHeaders['If-None-Match'] = cachedEntry.etag;
      }
    }

    try {
      const response = await this.http.axiosRef.get(url, {
        headers: finalHeaders,
        timeout,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
      });

    if (response.status === 304) {
        if (cachedEntry) { 
          return {
            ...response,
            status: 200, 
            data: cachedEntry.data as any, 
          };
        } else {
          throw new Error(`304 Not Modified recebido, mas sem cache local para ${url}`);
        }
      }

      if (response.status === 200) {
        const etag = response.headers['etag']; 
        
        await this.prisma.githubCache.upsert({
          where: { url },
          update: { 
            etag: etag ?? null, 
            data: response.data 
          },
          create: { 
            url: url, 
            etag: etag ?? null, 
            data: response.data 
          },
        });
      }
      return response;

    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.message || err;
      
      if (cachedEntry) {
        this.logger.warn(`[Cache STALE] Request falhou (${status}), retornando cache antigo para ${url}`);
        return {
          ...err.response, 
          status: 200, 
          data: cachedEntry.data as any,
          headers: { 'x-cache-status': 'stale' }
        }
      }

      throw { status, message, original: err };
    }
  }

  private async _fetchDefaultBranch(owner: string, repo: string, userToken?: string): Promise<string> {
    try { const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`; const repoRes = await this.httpGet(repoInfoUrl, undefined, undefined, userToken); return repoRes.data?.default_branch || 'main'; }
    catch (err: any) { return 'main'; }
  }

  async getUserRepos(username: string, userToken?: string) {
    const per_page = 100; let page = 1; const all: any[] = [];
    while (true) {
      const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=${per_page}&page=${page}`;
      try { const res = await this.httpGet(url, undefined, undefined, userToken); const data = res.data || []; all.push(...data); if (data.length < per_page) break; page += 1; }
      catch (err: any) { if (err.status === 404) return []; throw err.original || err; }
    }
    return all.map(repo => ({ 
      name: repo.name, 
      owner: { login: repo.owner?.login }, 
      url: repo.html_url, 
      private: !!repo.private, 
      default_branch: repo.default_branch || 'main',
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      open_issues_count: repo.open_issues_count,
      forks_count: repo.forks_count
    }));
  }

  async getCommits(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
    try { const res = await this.httpGet(url, undefined, undefined, userToken); return (res.data || []).map((c: any) => c.commit?.message).filter(Boolean); }
    catch (err: any) { return []; }
  }

  async getBranches(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`;
    try { const res = await this.httpGet(url, undefined, undefined, userToken); return (res.data || []).map((b: any) => b.name).filter(Boolean); }
    catch (err: any) { return []; }
  }

  async getPullRequests(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`;
    try { const res = await this.httpGet(url, undefined, undefined, userToken); return (res.data || []).map((pr: any) => ({ number: pr.number, title: pr.title, state: pr.state, user: pr.user?.login })); }
    catch (err: any) { return []; }
  }

  async getContributors(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`;
    try { const res = await this.httpGet(url, undefined, undefined, userToken); return (res.data || []).map((c: any) => ({ login: c.login, contributions: c.contributions })); }
    catch (err: any) { return []; }
  }

  async getIssues(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?per_page=100`;
    try { const res = await this.httpGet(url, undefined, undefined, userToken); return (res.data || []).filter((i: any) => !i.pull_request).map((issue: any) => ({ number: issue.number, title: issue.title, state: issue.state, user: issue.user?.login, body: issue.body })); }
    catch (err: any) { return []; }
  }

  async getReleases(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`;
    try { const res = await this.httpGet(url, undefined, undefined, userToken); return (res.data || []).map((release: any) => ({ name: release.name, tag: release.tag_name, published_at: release.published_at })); }
    catch (err: any) { return []; }
  }

  async getReadme(owner: string, repo: string, userToken?: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo, userToken); const url = `https://api.github.com/repos/${owner}/${repo}/readme?ref=${encodeURIComponent(branch)}`; const response = await this.httpGet(url, undefined, undefined, userToken); return { name: response.data.name, path: response.data.path, content: this.decodeBase64(response.data.content) }; }
    catch (err: any) { return { name: 'README.md', path: 'README.md', content: null }; }
  }

  async getLicenses(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/license`;
    try {
      const res = await this.httpGet(url, undefined, undefined, userToken);
      const data = res.data;
      if (!data || !data.license) {
        return { name: 'Unlicensed', key: 'unlicensed', fileName: data?.name || null, content: null };
      }
      return {
        name: data.license.name,
        key: data.license.spdx_id || data.license.key || null,
        fileName: data.name || null,
        content: this.decodeBase64(data?.content) ?? null,
      };
    }
    catch (err: any) { return { name: 'Unlicensed', key: 'unlicensed', fileName: null, content: null }; }
  }

  async getGitignore(owner: string, repo: string, userToken?: string) {
    let effectiveBranch = 'main'; try { effectiveBranch = await this._fetchDefaultBranch(owner, repo, userToken); } catch {}
    try { const url = `https://api.github.com/repos/${owner}/${repo}/contents/.gitignore`; const res = await this.httpGet(url, undefined, undefined, userToken); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; }
    catch (err: any) { if (err.status === 404) { try { const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(effectiveBranch)}?recursive=1`; const treeRes = await this.httpGet(treeUrl, undefined, undefined, userToken); const entry = (treeRes.data.tree || []).find((e: any) => e.type === 'blob' && path.basename(e.path).toLowerCase() === '.gitignore'); if (!entry) return { content: null, sha: null, path: null }; const blobRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${entry.sha}`, undefined, undefined, userToken); return { content: this.decodeBase64(blobRes.data?.content), sha: entry.sha, path: entry.path }; } catch (treeErr: any) { return { content: null, sha: null, path: null }; } } return { content: null, sha: null, path: null }; }
  }

  async getChangelog(owner: string, repo: string, userToken?: string) {
    const candidates = ['CHANGELOG.md', 'changelog.md', 'CHANGELOG', 'changelog']; let branch = 'main'; try { branch = await this._fetchDefaultBranch(owner, repo, userToken); } catch {}
    try { for (const cand of candidates) { try { const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(cand)}?ref=${encodeURIComponent(branch)}`; const res = await this.httpGet(url, undefined, undefined, userToken); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; } catch (err: any) { if (err.status !== 404) throw err; } } const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`; const treeRes = await this.httpGet(treeUrl, undefined, undefined, userToken); const entry = (treeRes.data.tree || []).find((e: any) => e.type === 'blob' && candidates.includes(path.basename(e.path).toLowerCase())); if (!entry) return { content: null, sha: null, path: null }; const blobRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${entry.sha}`, undefined, undefined, userToken); return { content: this.decodeBase64(blobRes.data?.content), sha: entry.sha, path: entry.path }; }
    catch (err: any) { return { content: null, sha: null, path: null }; }
  }

  async getContributing(owner: string, repo: string, userToken?: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo, userToken); const url = `https://api.github.com/repos/${owner}/${repo}/contents/CONTRIBUTING.md?ref=${encodeURIComponent(branch)}`; const res = await this.httpGet(url, undefined, undefined, userToken); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; }
    catch (err: any) { return { content: null, sha: null, path: null }; }
  }

  async getConductCode(owner: string, repo: string, userToken?: string) {
    let branch = 'main'; try { branch = await this._fetchDefaultBranch(owner, repo, userToken); } catch {}
    try { const url = `https://api.github.com/repos/${owner}/${repo}/contents/CODE_OF_CONDUCT.md?ref=${encodeURIComponent(branch)}`; const res = await this.httpGet(url, undefined, undefined, userToken); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; }
    catch (err: any) { if (err.status === 404) { try { const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/contents/.github/CODE_OF_CONDUCT.md?ref=${encodeURIComponent(branch)}`; const fallbackRes = await this.httpGet(fallbackUrl, undefined, undefined, userToken); return { content: this.decodeBase64(fallbackRes.data.content), sha: fallbackRes.data.sha, path: fallbackRes.data.path }; } catch (fallbackErr: any) { return { content: null, sha: null, path: null }; } } return { content: null, sha: null, path: null }; }
  }

  async getDocs(owner: string, repo: string, userToken?: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/Docs/`;
    try {
      const response = await this.httpGet(url, undefined, undefined, userToken);
      return (response.data || []).filter((item: any) => item.type === 'file').map((file: any) => ({ name: file.name, path: file.path, download_url: file.download_url }));
    }
    catch (error: any) {
      if (error.status === 404) {
        const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/contents/docs/`;
        try {
          const fallbackResponse = await this.httpGet(fallbackUrl, undefined, undefined, userToken);
          return (fallbackResponse.data || []).filter((item: any) => item.type === 'file').map((file: any) => ({ name: file.name, path: file.path, download_url: file.download_url }));
        } catch { return []; }
      }
      throw error.original || error;
    }
  }

  async getDocsContent(owner: string, repo: string, userToken?: string) {
    const files = await this.getDocs(owner, repo, userToken);
    if (!Array.isArray(files) || files.length === 0) return [];
    const limit = Math.max(1, Math.min(this.CONCURRENCY, 5));
    const docs = await this.mapWithConcurrency(files, limit, async (file) => {
      try {
        const response = await this.httpGet(file.download_url, { Accept: 'application/vnd.github.raw' }, undefined, userToken);
        return { name: file.name, content: response.data };
      } catch {
        return { name: file.name, content: null };
      }
    });
    return docs.filter(Boolean);
  }

  async getIssueAndPrTemplates(owner: string, repo: string, userToken?: string) {
    const files: { name: string; content: string | null }[] = [];
    const fetchFile = async (path: string) => {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
        const res = await this.httpGet(url, undefined, undefined, userToken);
        return { name: path.split('/').pop() || path, content: this.decodeBase64(res.data?.content) };
      } catch {
        return null;
      }
    };

    const singleFiles = [
      '.github/ISSUE_TEMPLATE.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
      'ISSUE_TEMPLATE.md',
      'PULL_REQUEST_TEMPLATE.md',
    ];

    for (const path of singleFiles) {
      const result = await fetchFile(path);
      if (result) files.push(result);
    }

    const directories = ['.github/ISSUE_TEMPLATE', '.github/PULL_REQUEST_TEMPLATE'];
    for (const dir of directories) {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(dir)}`;
        const res = await this.httpGet(url, undefined, undefined, userToken);
        const entries = Array.isArray(res.data) ? res.data : [];
        for (const entry of entries) {
          if (entry.type !== 'file') continue;
          const fetched = await fetchFile(entry.path || entry.name);
          if (fetched) files.push(fetched);
        }
      } catch {
        continue;
      }
    }

    return files;
  }

  async getRepoTree(owner: string, repo: string, userToken?: string) {
    try {
      const branch = await this._fetchDefaultBranch(owner, repo, userToken);
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
      const res = await this.httpGet(treeUrl, undefined, undefined, userToken);
      const tree = res.data?.tree || [];
      const result = tree.map((entry: any) => ({ path: entry.path, type: entry.type }));
      return result;
    } catch (err: any) {
      throw err.original || err;
    }
  }

  async getGovernance(owner: string, repo: string, userToken?: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo, userToken); const patterns = ['governance.md']; const { resultsByPath } = await this.fetchChecklistMdFiles(owner, repo, patterns, branch, userToken); const result = Object.values(resultsByPath).find(r => r.content && path.basename(r.path).toLowerCase() === 'governance.md'); return { path: result?.path || null, content: result?.content || null }; }
    catch (err: any) { return { path: null, content: null }; }
  }

  async getArchitecture(owner: string, repo: string, userToken?: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo, userToken); const patterns = ['architecture.md', 'arquitetura.md']; const { resultsByPath } = await this.fetchChecklistMdFiles(owner, repo, patterns, branch, userToken); const result = Object.values(resultsByPath).filter(r => r.content && patterns.includes(path.basename(r.path).toLowerCase())).sort((a, b) => a.path.length - b.path.length)[0]; return { path: result?.path || null, content: result?.content || null }; }
    catch (err: any) { return { path: null, content: null }; }
  }

  async getRoadmap(owner: string, repo: string, userToken?: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo, userToken); const patterns = ['roadmap.md']; const { resultsByPath } = await this.fetchChecklistMdFiles(owner, repo, patterns, branch, userToken); const result = Object.values(resultsByPath).find(r => r.content && path.basename(r.path).toLowerCase() === 'roadmap.md'); return { path: result?.path || null, content: result?.content || null }; }
    catch (err: any) { return { path: null, content: null }; }
  }

  async fetchChecklistMdFiles(owner: string, repo: string, patterns: string[], branch: string, userToken?: string) {
    let tree: any[] = [];
    try {
      try { tree = (await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, undefined, undefined, userToken)).data.tree || []; }
      catch { const refRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, undefined, undefined, userToken); const commitSha = refRes.data.object.sha; const commitRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`, undefined, undefined, userToken); const treeSha = commitRes.data.tree.sha; tree = (await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`, undefined, undefined, userToken)).data.tree || []; }
    } catch (err: any) { return { patternResults: {}, resultsByPath: {}, summary: { totalPatterns: patterns.length, totalMdFilesMatched: 0, fetched: 0, skipped: 0 } }; }
    
    const blobs = tree.filter(e => e.type === 'blob'); const allPaths = blobs.map(b => b.path); const pathMap = new Map(blobs.map(b => [b.path.toLowerCase(), b]));
    const resolvePattern = (pat: string) => { const matches = new Set<string>(); const ptrim = pat.trim(); if (ptrim === '/') { allPaths.forEach(p => matches.add(p)); } else if (ptrim.endsWith('/')) { const prefix = ptrim.replace(/^\/+|\/+$/g, '').toLowerCase() + '/'; for (const p of allPaths) if (p.toLowerCase().startsWith(prefix)) matches.add(p); } else if (ptrim.includes('*')) { const regex = new RegExp('^' + ptrim.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$', 'i'); for (const p of allPaths) if (regex.test(p)) matches.add(p); } else { const norm = ptrim.replace(/^\/+/, '').toLowerCase(); if (pathMap.has(norm)) { const found = blobs.find(b => b.path.toLowerCase() === norm); if (found) matches.add(found.path); } for (const p of allPaths) if (path.basename(p).toLowerCase() === norm) matches.add(p); } return [...matches].filter(p => /\.md$/i.test(p)); };
    const patternMatches: Record<string, string[]> = {}; const allMatchedPathsSet = new Set<string>(); for (const patt of patterns) { try { const m = resolvePattern(patt); patternMatches[patt] = m; m.forEach(p => allMatchedPathsSet.add(p)); } catch { patternMatches[patt] = []; } }
    const allMatchedPaths = [...allMatchedPathsSet]; const resultsByPath: Record<string, { path: string; sha?: string; content: string | null; skipped?: string }> = {};
    
    const worker = async (p: string) => {
      const entry = blobs.find(b => b.path === p); if (!entry) { resultsByPath[p] = { path: p, content: null, skipped: 'not_found' }; return; } if (!/\.md$/i.test(entry.path)) { resultsByPath[p] = { path: p, content: null, skipped: 'not_md' }; return; } if (entry.size > this.MAX_BYTES) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'too_large' }; return; }
      try { const blobRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${entry.sha}`, undefined, undefined, userToken); const buffer = Buffer.from(blobRes.data?.content || '', 'base64'); if (buffer.length > this.MAX_BYTES) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'too_large' }; return; } if (this.bufferIsProbablyBinary(buffer)) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'binary' }; return; } resultsByPath[p] = { path: p, sha: entry.sha, content: buffer.toString('utf8') }; } catch (err: any) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'error' }; }
    };
    await this.mapWithConcurrency(allMatchedPaths, Math.min(this.CONCURRENCY, 5), worker);
    
    const patternResults: Record<string, { path: string; sha?: string; content: string | null; skipped?: string }[]> = {}; for (const patt of patterns) { patternResults[patt] = (patternMatches[patt] || []).map(p => resultsByPath[p] || { path: p, content: null, skipped: 'not_fetched' }); } const summary = { totalPatterns: patterns.length, totalMdFilesMatched: allMatchedPaths.length, fetched: Object.values(resultsByPath).filter(r => r.content !== null).length, skipped: Object.values(resultsByPath).filter(r => r.skipped).length };
    return { patternResults, resultsByPath, summary };
  }

  async getFormattedCachedRepos() {
    this.logger.debug(`[Cache Read] Buscando todos os repositórios da tabela 'GithubRepoData'...`);
    const allCache = await this.prisma.githubRepoData.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    return allCache.map(repoData => repoData.data);
  }

  formatRepoData(reposData: any[]) {
    return reposData.map((repo, index) => {
      const allDocs = repo.docsContent || [];
      const findDocContent = (basename: string) => {
        const lowerBasename = basename.toLowerCase();
        const matches = allDocs.filter(
          (d: any) => d.name && d.name.toLowerCase() === lowerBasename,
        );
        if (matches.length === 0) return null;
        if (matches.length === 1) return matches[0].content;
        matches.sort((a: any, b: any) => a.path.length - b.path.length);
        return matches[0].content;
      };

      const apiLicenseValid = repo.license?.key && repo.license.key !== 'unlicensed';

      const normalizedScore = typeof repo.score === 'number' ? repo.score : -1;

      return {
        id: index + 1, 
        nomeRepositorio: repo.repo,
        commits: Array.isArray(repo.commits) ? repo.commits.length : 0,
        branches_count: Array.isArray(repo.branches) ? repo.branches.length : 0,
        prs_count: Array.isArray(repo.pullRequests) ? repo.pullRequests.length : 0,
        contributors_count: Array.isArray(repo.contributors) ? repo.contributors.length : 0,
        score: normalizedScore,
        stargazers_count: repo.stargazers_count || 0, 
        watchers_count: repo.watchers_count || 0,     
        open_issues_count: repo.open_issues_count || 0, 
        forks_count: repo.forks_count || 0,           
        ultimosCommits: Array.isArray(repo.commits) ? repo.commits.slice(0, 5) : [],
        branches: Array.isArray(repo.branches) ? repo.branches.slice(0, 5) : [],
        pullRequests: Array.isArray(repo.pullRequests) ? repo.pullRequests.slice(0, 5) : [],
        contributors: Array.isArray(repo.contributors) ? repo.contributors.slice(0, 5) : [],

        detalhes: {
          readme: findDocContent('readme.md'),
          changelog: findDocContent('changelog.md'),
          conduct: findDocContent('code_of_conduct.md'),
          license: apiLicenseValid ? repo.license.name : null,
          gitignore: repo.gitignore?.content || null,
          governance: findDocContent('governance.md'),
          arquitetura:
            findDocContent('arquitetura.md') ||
            findDocContent('architecture.md'),
          roadmap: findDocContent('roadmap.md'),
          docs: allDocs,
        },
      };
    });
  }

  async checkRepoChanged(owner: string, repo: string, forceUpdate: boolean = false, userToken?: string): Promise<{ changed: boolean, etag: string | null }> {
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;

    const cached = await this.prisma.githubCache.findUnique({
      where: { url: repoUrl },
    });

    const headers = this.defaultHeaders(userToken);
    
    if (!forceUpdate && cached?.etag) {
        headers['If-None-Match'] = cached.etag;
    }

    try {
      const res = await this.http.axiosRef.get(repoUrl, {
        headers,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
      });

      if (res.status === 304) {
        if (cached) {
          return { changed: false, etag: cached.etag }; 
        } else {
          return { changed: false, etag: null };
        }
      }

      const newEtag = res.headers['etag'] ?? null;
      await this.prisma.githubCache.upsert({
        where: { url: repoUrl },
        update: { etag: newEtag, data: res.data },
        create: { url: repoUrl, etag: newEtag, data: res.data },
      });

      return { changed: true, etag: newEtag };
    } catch (err: any) {
      if (cached) {
        return { changed: false, etag: cached.etag };
      }
      return { changed: true, etag: null }; 
    }
  }
  
  private async _analyzeSingleRepo(repo: { owner: { login: string }, name: string, default_branch: string, stargazers_count?: number, watchers_count?: number, open_issues_count?: number, forks_count?: number }, forceUpdate: boolean = false, userToken?: string): Promise<any> {
    const owner = repo.owner.login;
    const name = repo.name; 
    const defaultBranch = repo.default_branch;

    const cachedRepoData = await this.prisma.githubRepoData.findUnique({
      where: { 
        owner_repo: {
          owner: owner,
          repo: name 
        } 
      },
    });

    if (cachedRepoData && !forceUpdate) {
      return cachedRepoData.data;
    }

    const { changed: repoChanged, etag: repoEtag } = await this.checkRepoChanged(owner, name, forceUpdate, userToken);

    if (!repoChanged && cachedRepoData && cachedRepoData.etag === repoEtag) {
      return cachedRepoData.data;
    }
    
    try {
      let patterns: string[] = ['/'];
      try {
        const checklistPath = 'Docs/Milestones/Sprint-05/docsCheck-list.md';
        const chkUrl = `https://api.github.com/repos/${owner}/${name}/contents/${encodeURIComponent(checklistPath)}?ref=${encodeURIComponent(defaultBranch)}`;
        const chkRes = await this.httpGet(chkUrl, undefined, undefined, userToken);
        const chkContent = this.decodeBase64(chkRes.data.content);
        if (chkContent) {
          const lines = chkContent.split(/\r?\n/);
          const tableLines = lines.filter(l => l.includes('|') && !/^\s*\|?[-\s:|]+\|?\s*$/.test(l));
          const items: string[] = [];
          for (const tl of tableLines) {
            const parts = tl.split('|').map(s => s.trim());
            const first = parts.find(p => p.length > 0);
            if (first && !/^Documento|^Item/i.test(first)) items.push(first.replace(/`/g, '').trim());
          }
          const parsedPatterns = Array.from(new Set(items)).filter(Boolean);
          if (parsedPatterns.length > 0) patterns = parsedPatterns;
        }
      } catch { }

      const [commitsSettled, issuesSettled, releasesSettled, readmeSettled, changelogSettled, licenseSettled, contributingSettled, conductSettled, gitignoreSettled, docsListSettled, branchesSettled, prsSettled, contributorsSettled] = await Promise.allSettled([
        this.getCommits(owner, name, userToken), 
        this.getIssues(owner, name, userToken), 
        this.getReleases(owner, name, userToken), 
        this.getReadme(owner, name, userToken), 
        this.getChangelog(owner, name, userToken), 
        this.getLicenses(owner, name, userToken), 
        this.getContributing(owner, name, userToken), 
        this.getConductCode(owner, name, userToken), 
        this.getGitignore(owner, name, userToken), 
        this.getDocs(owner, name, userToken),
        this.getBranches(owner, name, userToken),
        this.getPullRequests(owner, name, userToken),
        this.getContributors(owner, name, userToken)
      ]);
      
      const { patternResults, resultsByPath, summary } = await this.fetchChecklistMdFiles(owner, name, patterns, defaultBranch, userToken);
      
      const docsContentArray = Object.values(resultsByPath).map(r => ({ name: path.basename(r.path), content: r.content, path: r.path, skipped: r.skipped }));
      
      const analysisResult = {
        owner: owner,
        repo: name, 
        score: (cachedRepoData?.data as any)?.score ?? -1,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        open_issues_count: repo.open_issues_count, 
        forks_count: repo.forks_count, 
        branches: branchesSettled.status === 'fulfilled' ? branchesSettled.value : [],
        pullRequests: prsSettled.status === 'fulfilled' ? prsSettled.value : [],
        contributors: contributorsSettled.status === 'fulfilled' ? contributorsSettled.value : [],
        commits: commitsSettled.status === 'fulfilled' ? commitsSettled.value : [], 
        issues: issuesSettled.status === 'fulfilled' ? issuesSettled.value : [], 
        releases: releasesSettled.status === 'fulfilled' ? releasesSettled.value : [], 
        readme: readmeSettled.status === 'fulfilled' ? readmeSettled.value : { content: null }, 
        changelog: changelogSettled.status === 'fulfilled' ? changelogSettled.value : { content: null }, 
        conductcode: conductSettled.status === 'fulfilled' ? conductSettled.value : { content: null }, 
        license: licenseSettled.status === 'fulfilled' ? licenseSettled.value : { name: 'Unlicensed' }, 
        gitignore: gitignoreSettled.status === 'fulfilled' ? gitignoreSettled.value : { content: null }, 
        docs: docsListSettled.status === 'fulfilled' ? docsListSettled.value : [], 
        contributing: contributingSettled.status === 'fulfilled' ? contributingSettled.value : { content: null }, 
        docsContent: docsContentArray || [], 
        checklistSummary: summary, 
        checklistMatches: patternResults,
      };

      const formattedData = this.formatRepoData([analysisResult])[0];
      
      await this.prisma.githubRepoData.upsert({
        where: {
          owner_repo: {
            owner: repo.owner.login,
            repo: repo.name
          }
        },
        create: {
          id: randomUUID(),
          owner: repo.owner.login,
          repo: repo.name,
          etag: repoEtag ?? null,
          data: formattedData,
          lastDiff: {}
        },
        update: {
          data: formattedData,
          etag: repoEtag ?? null
        }
      });

      return formattedData;

    } catch (err: any) { 
      this.logger.warn(`analyzeUserRepos per-repo error ${owner}/${name}: ${err?.message || err}`); 
      return null;
    }
  }

  async analyzeUserRepos(username: string, forceUpdate: boolean = false, userToken?: string) {
    let repos = await this.getUserRepos(username, userToken);
    repos = repos.slice(0, 45); 

    this.logger.debug(`[Analyze] Iniciando análise paralela para ${repos.length} repositórios...`);

    const allResults = await this.mapWithConcurrency(
      repos,
      this.CONCURRENCY,
      (repo) => this._analyzeSingleRepo(repo, forceUpdate, userToken)
    );

    this.logger.debug(`[Analyze] Análise paralela concluída. ${allResults.length} resultados.`);

    return allResults.filter(Boolean).map((repo: any, index: number) => ({
        ...repo,
        id: index + 1
    }));
  }

  async getAllCache() {
    const results = await this.prisma.githubCache.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        url: true,
        etag: true,
        updatedAt: true,
        data: true,
      },
    });

    return results.map((r) => ({
      owner: this.extractOwner(r.url),
      repo: this.extractRepo(r.url),
      updatedAt: r.updatedAt,
      data: r.data,
    }));
  }

  async getCacheByUrl(url: string) {
    const result = await this.prisma.githubCache.findUnique({ where: { url } });
    if (!result) throw new NotFoundException(`Cache não encontrado para ${url}`);

    return {
      owner: this.extractOwner(result.url),
      repo: this.extractRepo(result.url),
      updatedAt: result.updatedAt,
      data: result.data,
    };
  }

  private extractOwner(url: string): string {
    const match = url.match(/repos\/([^/]+)/) || url.match(/analysis_v1\/([^/]+)/);
    return match ? match[1] : '';
  }

  private extractRepo(url: string): string {
    const match = url.match(/repos\/[^/]+\/([^/?]+)/) || url.match(/analysis_v1\/[^/]+\/([^/?]+)/);
    return match ? match[1] : '';
  }

  async getCachedRepoAnalysis(owner: string, repo: string) {
    return this.prisma.githubCache.findUnique({
      where: { url: `analysis_v1/${owner}/${repo}` },
    });
  }

  async saveCachedRepoAnalysis(owner: string, repo: string, etag: string | null, data: any) {
    await this.prisma.githubCache.upsert({
      where: { url: `analysis_v1/${owner}/${repo}` },
      update: { data, etag },
      create: { url: `analysis_v1/${owner}/${repo}`, data, etag },
    });
  }
}