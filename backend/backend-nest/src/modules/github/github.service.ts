import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Buffer } from 'buffer';
import path from 'path';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  constructor(private readonly http: HttpService) {}

  private token = process.env.GITHUB_TOKEN;
  private readonly MAX_BYTES = Number(process.env.GH_MAX_BYTES || 200 * 1024);
  private readonly CONCURRENCY = Number(process.env.GH_CONCURRENCY || 5);

  private defaultHeaders() {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
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

  private async httpGet(url: string, headers?: Record<string, string>, timeout = 15000) {
    try { return await this.http.axiosRef.get(url, { headers: { ...this.defaultHeaders(), ...(headers || {}) }, timeout }); }
    catch (err: any) { const status = err?.response?.status; const message = err?.message || err; throw { status, message, original: err }; }
  }

   private async _fetchDefaultBranch(owner: string, repo: string): Promise<string> {
      try { const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`; const repoRes = await this.httpGet(repoInfoUrl); return repoRes.data?.default_branch || 'main'; }
      catch (err: any) { this.logger.warn(`_fetchDefaultBranch: Failed for ${owner}/${repo}: ${err?.message || err}. Assuming 'main'.`); return 'main'; }
  }

  async getUserRepos(username: string) {
    const per_page = 100; let page = 1; const all: any[] = [];
    while (true) {
      const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=${per_page}&page=${page}`;
      try { const res = await this.httpGet(url); const data = res.data || []; all.push(...data); if (data.length < per_page) break; page += 1; }
      catch (err: any) { if (err.status === 404) return []; this.logger.warn(`getUserRepos error for ${username}: ${err.message}`); throw err.original || err; }
    }
    return all.map(repo => ({ name: repo.name, owner: { login: repo.owner?.login }, url: repo.html_url, private: !!repo.private, default_branch: repo.default_branch || 'main' }));
  }

  async getCommits(owner: string, repo: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
    try { const res = await this.httpGet(url); return (res.data || []).map((c: any) => c.commit?.message).filter(Boolean); }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getCommits ${owner}/${repo}: ${err.message}`); return []; }
  }

  async getIssues(owner: string, repo: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?per_page=100`;
    try { const res = await this.httpGet(url); return (res.data || []).filter((i: any) => !i.pull_request).map((issue: any) => ({ number: issue.number, title: issue.title, state: issue.state, user: issue.user?.login, body: issue.body })); }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getIssues ${owner}/${repo}: ${err.message}`); return []; }
  }

  async getReleases(owner: string, repo: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`;
    try { const res = await this.httpGet(url); return (res.data || []).map((release: any) => ({ name: release.name, tag: release.tag_name, published_at: release.published_at })); }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getReleases ${owner}/${repo}: ${err.message}`); return []; }
  }

  async getReadme(owner: string, repo: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo); const url = `https://api.github.com/repos/${owner}/${repo}/readme?ref=${encodeURIComponent(branch)}`; const response = await this.httpGet(url); return { name: response.data.name, path: response.data.path, content: this.decodeBase64(response.data.content) }; }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getReadme ${owner}/${repo}: ${err.message}`); return { name: 'README.md', path: 'README.md', content: null }; }
  }

  async getLicenses(owner: string, repo: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/license`;
    try { const res = await this.httpGet(url); const data = res.data; if (!data || !data.license) return { name: 'Unlicensed', key: 'unlicensed', fileName: data?.name || null }; return { name: data.license.name, key: data.license.spdx_id || data.license.key || null, fileName: data.name || null }; }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getLicenses ${owner}/${repo}: ${err.message}`); return { name: 'Unlicensed', key: 'unlicensed', fileName: null }; }
  }

  async getGitignore(owner: string, repo: string) {
     let effectiveBranch = 'main'; try { effectiveBranch = await this._fetchDefaultBranch(owner, repo); } catch {/*ignore*/}
     try { const url = `https://api.github.com/repos/${owner}/${repo}/contents/.gitignore`; const res = await this.httpGet(url); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; }
     catch (err: any) { if (err.status === 404) { try { const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(effectiveBranch)}?recursive=1`; const treeRes = await this.httpGet(treeUrl); const entry = (treeRes.data.tree || []).find((e: any) => e.type === 'blob' && path.basename(e.path).toLowerCase() === '.gitignore'); if (!entry) return { content: null, sha: null, path: null }; const blobRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${entry.sha}`); return { content: this.decodeBase64(blobRes.data?.content), sha: entry.sha, path: entry.path }; } catch (treeErr: any) { this.logger.warn(`getGitignore fallback error for ${owner}/${repo}@${effectiveBranch}: ${treeErr?.message || treeErr}`); return { content: null, sha: null, path: null };} } this.logger.warn(`getGitignore error for ${owner}/${repo}: ${err.message}`); return { content: null, sha: null, path: null }; }
  }

  async getChangelog(owner: string, repo: string) {
    const candidates = ['CHANGELOG.md', 'changelog.md', 'CHANGELOG', 'changelog']; let branch = 'main'; try { branch = await this._fetchDefaultBranch(owner, repo); } catch {/*ignore*/}
    try { for (const cand of candidates) { try { const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(cand)}?ref=${encodeURIComponent(branch)}`; const res = await this.httpGet(url); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; } catch (err: any) { if (err.status !== 404) throw err; } } const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`; const treeRes = await this.httpGet(treeUrl); const entry = (treeRes.data.tree || []).find((e: any) => e.type === 'blob' && candidates.includes(path.basename(e.path).toLowerCase())); if (!entry) return { content: null, sha: null, path: null }; const blobRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${entry.sha}`); return { content: this.decodeBase64(blobRes.data?.content), sha: entry.sha, path: entry.path }; }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getChangelog ${owner}/${repo}@${branch}: ${err.message}`); return { content: null, sha: null, path: null }; }
  }

  async getContributing(owner: string, repo: string) {
     try { const branch = await this._fetchDefaultBranch(owner, repo); const url = `https://api.github.com/repos/${owner}/${repo}/contents/CONTRIBUTING.md?ref=${encodeURIComponent(branch)}`; const res = await this.httpGet(url); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; }
     catch (err: any) { if (err.status !== 404) this.logger.warn(`getContributing ${owner}/${repo}: ${err.message}`); return { content: null, sha: null, path: null }; }
  }

  async getConductCode(owner: string, repo: string) {
     let branch = 'main'; try { branch = await this._fetchDefaultBranch(owner, repo); } catch {/*ignore*/}
     try { const url = `https://api.github.com/repos/${owner}/${repo}/contents/CODE_OF_CONDUCT.md?ref=${encodeURIComponent(branch)}`; const res = await this.httpGet(url); return { content: this.decodeBase64(res.data.content), sha: res.data.sha, path: res.data.path }; }
     catch (err: any) { if (err.status === 404) { try { const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/contents/.github/CODE_OF_CONDUCT.md?ref=${encodeURIComponent(branch)}`; const fallbackRes = await this.httpGet(fallbackUrl); return { content: this.decodeBase64(fallbackRes.data.content), sha: fallbackRes.data.sha, path: fallbackRes.data.path }; } catch (fallbackErr: any) { if (fallbackErr.status !== 404) this.logger.warn(`getConductCode fallback ${owner}/${repo}: ${fallbackErr.message}`); return { content: null, sha: null, path: null }; } } this.logger.warn(`getConductCode ${owner}/${repo}: ${err.message}`); return { content: null, sha: null, path: null }; }
  }

  async getDocs(owner: string, repo: string) {
     const url = `https://api.github.com/repos/${owner}/${repo}/contents/Docs/`; try { const response = await this.http.axiosRef.get(url, { headers: { ...this.defaultHeaders() } }); return (response.data || []).filter((item: any) => item.type === 'file').map((file: any) => ({ name: file.name, path: file.path, download_url: file.download_url })); }
     catch (error: any) { if (error.response?.status === 404) { const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/contents/docs/`; try { const fallbackResponse = await this.http.axiosRef.get(fallbackUrl, { headers: { ...this.defaultHeaders() } }); return (fallbackResponse.data || []).filter((item: any) => item.type === 'file').map((file: any) => ({ name: file.name, path: file.path, download_url: file.download_url })); } catch { return []; } } throw error; }
  }

  async getDocsContent(owner: string, repo: string) {
    const files = await this.getDocs(owner, repo); if (!Array.isArray(files) || files.length === 0) return []; const docs: { name: string; content: string | null }[] = [];
    for (const file of files) { try { const response = await this.http.axiosRef.get(file.download_url, { headers: { Accept: 'application/vnd.github.raw' } }); docs.push({ name: file.name, content: response.data }); } catch (err: any) { docs.push({ name: file.name, content: null }); } } return docs;
  }

  async getRepoTree(owner: string, repo: string) {
  // no cache here; fetch directly
    try {
      const branch = await this._fetchDefaultBranch(owner, repo);
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
      const res = await this.httpGet(treeUrl);
      const tree = res.data?.tree || [];
  const result = tree.map((entry: any) => ({ path: entry.path, type: entry.type }));
  return result;
    } catch (err: any) {
      this.logger.warn(`getRepoTree ${owner}/${repo}: ${err?.message || err}`);
      throw err.original || err;
    }
  }

  async getGovernance(owner: string, repo: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo); const patterns = ['governance.md']; const { resultsByPath } = await this.fetchChecklistMdFiles(owner, repo, patterns, branch); const result = Object.values(resultsByPath).find(r => r.content && path.basename(r.path).toLowerCase() === 'governance.md'); return { path: result?.path || null, content: result?.content || null }; }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getGovernance ${owner}/${repo}: ${err.message}`); return { path: null, content: null }; }
  }

  async getArchitecture(owner: string, repo: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo); const patterns = ['architecture.md', 'arquitetura.md']; const { resultsByPath } = await this.fetchChecklistMdFiles(owner, repo, patterns, branch); const result = Object.values(resultsByPath).filter(r => r.content && patterns.includes(path.basename(r.path).toLowerCase())).sort((a,b) => a.path.length - b.path.length)[0]; return { path: result?.path || null, content: result?.content || null }; }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getArchitecture ${owner}/${repo}: ${err.message}`); return { path: null, content: null }; }
  }

  async getRoadmap(owner: string, repo: string) {
    try { const branch = await this._fetchDefaultBranch(owner, repo); const patterns = ['roadmap.md']; const { resultsByPath } = await this.fetchChecklistMdFiles(owner, repo, patterns, branch); const result = Object.values(resultsByPath).find(r => r.content && path.basename(r.path).toLowerCase() === 'roadmap.md'); return { path: result?.path || null, content: result?.content || null }; }
    catch (err: any) { if (err.status !== 404) this.logger.warn(`getRoadmap ${owner}/${repo}: ${err.message}`); return { path: null, content: null }; }
  }

  async fetchChecklistMdFiles(owner: string, repo: string, patterns: string[], branch: string) {
    let tree: any[] = []; try { try { tree = (await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`)).data.tree || []; } catch { const refRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`); const commitSha = refRes.data.object.sha; const commitRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`); const treeSha = commitRes.data.tree.sha; tree = (await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`)).data.tree || []; } } catch (err: any) { this.logger.warn(`fetchChecklistMdFiles: could not fetch tree for ${owner}/${repo}@${branch}: ${err?.message || err}`); return { patternResults: {}, resultsByPath: {}, summary: { totalPatterns: patterns.length, totalMdFilesMatched: 0, fetched: 0, skipped: 0 } }; }
    const blobs = tree.filter(e => e.type === 'blob'); const allPaths = blobs.map(b => b.path); const pathMap = new Map(blobs.map(b => [b.path.toLowerCase(), b]));
    const resolvePattern = (pat: string) => { const matches = new Set<string>(); const ptrim = pat.trim(); if (ptrim === '/') { allPaths.forEach(p => matches.add(p)); } else if (ptrim.endsWith('/')) { const prefix = ptrim.replace(/^\/+|\/+$/g, '').toLowerCase() + '/'; for (const p of allPaths) if (p.toLowerCase().startsWith(prefix)) matches.add(p); } else if (ptrim.includes('*')) { const regex = new RegExp('^' + ptrim.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$', 'i'); for (const p of allPaths) if (regex.test(p)) matches.add(p); } else { const norm = ptrim.replace(/^\/+/, '').toLowerCase(); if (pathMap.has(norm)) { const found = blobs.find(b => b.path.toLowerCase() === norm); if(found) matches.add(found.path); } for (const p of allPaths) if (path.basename(p).toLowerCase() === norm) matches.add(p); } return [...matches].filter(p => /\.md$/i.test(p)); };
    const patternMatches: Record<string, string[]> = {}; const allMatchedPathsSet = new Set<string>(); for (const patt of patterns) { try { const m = resolvePattern(patt); patternMatches[patt] = m; m.forEach(p => allMatchedPathsSet.add(p)); } catch { patternMatches[patt] = []; } }
    const allMatchedPaths = [...allMatchedPathsSet]; const resultsByPath: Record<string, { path: string; sha?: string; content: string | null; skipped?: string }> = {};
    const worker = async (p: string) => { const entry = blobs.find(b => b.path === p); if (!entry) { resultsByPath[p] = { path: p, content: null, skipped: 'not_found' }; return; } if (!/\.md$/i.test(entry.path)) { resultsByPath[p] = { path: p, content: null, skipped: 'not_md' }; return; } if (entry.size > this.MAX_BYTES) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'too_large' }; return; } try { const blobRes = await this.httpGet(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${entry.sha}`); const buffer = Buffer.from(blobRes.data?.content || '', 'base64'); if (buffer.length > this.MAX_BYTES) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'too_large' }; return; } if (this.bufferIsProbablyBinary(buffer)) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'binary' }; return; } resultsByPath[p] = { path: p, sha: entry.sha, content: buffer.toString('utf8') }; } catch (err: any) { resultsByPath[p] = { path: p, sha: entry.sha, content: null, skipped: 'error' }; } };
    await this.mapWithConcurrency(allMatchedPaths, this.CONCURRENCY, worker);
    const patternResults: Record<string, { path: string; sha?: string; content: string | null; skipped?: string }[]> = {}; for (const patt of patterns) { patternResults[patt] = (patternMatches[patt] || []).map(p => resultsByPath[p] || { path: p, content: null, skipped: 'not_fetched' }); } const summary = { totalPatterns: patterns.length, totalMdFilesMatched: allMatchedPaths.length, fetched: Object.values(resultsByPath).filter(r => r.content !== null).length, skipped: Object.values(resultsByPath).filter(r => r.skipped).length };
    return { patternResults, resultsByPath, summary };
  }

  async checkFolders(owner: string, repo: string) {
    let effectiveBranch = 'main'; try { effectiveBranch = await this._fetchDefaultBranch(owner, repo); } catch {/*ignore*/}
    const foldersToCheck = ['src', 'docs', 'src/components', 'src/hooks', 'src/utils', 'public'];
    const itemsToCheck: string[] = [ '.github/issue_template', 'governance.md', 'docs/governance.md', '.github/pull_request_template.md', '.github/pull_request_template', 'arquitetura.md', 'docs/arquitetura.md', 'arquitetura', 'roadmap.md', 'docs/roadmap.md', 'roadmap', /*'license', 'license.md',*/ 'code_of_conduct.md', '.github/code_of_conduct.md', 'docs/code_of_conduct.md' ]; // Removido license daqui
    const gitignorePath = '.gitignore';
    const licensePatterns = [ 'license', 'license.md', 'license.txt', 'copying', 'copying.md', 'copying.txt', 'unlicense', 'unlicense.md', 'unlicense.txt', 'licence' ];
    const results: ({ path: string; exists: boolean })[] = [];
    const defaultResults = foldersToCheck.map(p => ({ path: p, exists: false })).concat([ { path: 'issue_templates', exists: false }, { path: 'governance', exists: false }, { path: 'pull_request_template', exists: false }, { path: 'arquitetura', exists: false }, { path: 'roadmap', exists: false }, { path: gitignorePath, exists: false }, /*{ path: 'license', exists: false },*/ { path: 'code_of_conduct', exists: false }, { path: 'changelog', exists: false }, { path: 'license_file_check', exists: false } ]); // Adicionado license_file_check default

    try {
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(effectiveBranch)}?recursive=1`; const treeResponse = await this.http.axiosRef.get(treeUrl, { headers: { ...this.defaultHeaders() } }); const tree = treeResponse.data.tree || []; const allPaths = tree.map((item: any) => item.path.toLowerCase()); const allFilePaths = tree.filter((item: any) => item.path && item.type === 'blob').map((item: any) => item.path.toLowerCase());
      for (const folder of foldersToCheck) { const norm = folder.toLowerCase(); const exists = allFilePaths.some(p => p.startsWith(`${norm}/`) || p.includes(`/${norm}/`)); results.push({ path: folder, exists }); } const foundItems = new Set<string>(); for (const item of itemsToCheck) { const norm = item.toLowerCase(); const exists = allPaths.some(p => p === norm || p.startsWith(`${norm}/`)); if (exists) foundItems.add(norm); } const gitignoreExists = allFilePaths.some(p => path.basename(p) === gitignorePath); const changelogExists = allFilePaths.some(p => path.basename(p) === 'changelog.md');
      const licenseFileExists = allFilePaths.some(p => { const basenameLower = path.basename(p).toLowerCase(); return licensePatterns.some(pattern => basenameLower === pattern || basenameLower.startsWith(pattern + '.')); }); // Checagem da licença
      results.push({ path: 'issue_templates', exists: foundItems.has('.github/issue_template') }); results.push({ path: 'governance', exists: foundItems.has('governance.md') || foundItems.has('docs/governance.md') }); results.push({ path: 'pull_request_template', exists: foundItems.has('.github/pull_request_template.md') || foundItems.has('.github/pull_request_template') }); results.push({ path: 'arquitetura', exists: foundItems.has('arquitetura.md') || foundItems.has('docs/arquitetura.md') || foundItems.has('arquitetura') }); results.push({ path: 'roadmap', exists: foundItems.has('roadmap.md') || foundItems.has('docs/roadmap.md') || foundItems.has('roadmap') }); results.push({ path: 'code_of_conduct', exists: foundItems.has('code_of_conduct.md') || foundItems.has('.github/code_of_conduct.md') || foundItems.has('docs/code_of_conduct.md') }); results.push({ path: gitignorePath, exists: gitignoreExists }); results.push({ path: 'changelog', exists: changelogExists });
      results.push({ path: 'license_file_check', exists: licenseFileExists }); // Adiciona resultado da licença
      return results;
    } catch (error: any) { this.logger.warn(`checkFolders error for ${owner}/${repo}@${effectiveBranch}: ${error?.message || error}`); return defaultResults; }
  }


  formatRepoData(reposData: any[]) {
    return reposData.map((repo, index) => {
      const folderChecks = repo.checkFolders || []; const findCheck = (pathStr: string) => folderChecks.find((f: any) => f.path.toLowerCase() === pathStr.toLowerCase())?.exists || false; const allDocs = repo.docsContent || []; const findDocContent = (basename: string) => { const lowerBasename = basename.toLowerCase(); const matches = allDocs.filter((d: any) => d.name && d.name.toLowerCase() === lowerBasename); if (matches.length === 0) return null; if (matches.length === 1) return matches[0].content; matches.sort((a:any, b:any) => a.path.length - b.path.length); return matches[0].content; };
      const apiLicenseValid = repo.license?.key && repo.license.key !== 'unlicensed'; const fileLicenseExists = findCheck('license_file_check'); const possuiLicense = apiLicenseValid || fileLicenseExists; // CORREÇÃO APLICADA AQUI
      const possuiGitignore = !!repo.gitignore?.content || findCheck('.gitignore'); const possuiConductCode = !!findDocContent('code_of_conduct.md'); const possuiChangelog = !!findDocContent('changelog.md'); const possuiReadme = !!findDocContent('readme.md'); const possuiGovernance = !!findDocContent('governance.md'); const possuiArquitetura = !!findDocContent('arquitetura.md') || !!findDocContent('architecture.md'); const possuiRoadmap = !!findDocContent('roadmap.md');
      return {
        id: index + 1, nomeRepositorio: repo.repo, commits: Array.isArray(repo.commits) ? repo.commits.length : 0, ultimosCommits: Array.isArray(repo.commits) ? repo.commits.slice(0, 5) : [], possuiIssues: Array.isArray(repo.issues) && repo.issues.length > 0, possuiReleases: Array.isArray(repo.releases) && repo.releases.length > 0, possuiReadme: possuiReadme, possuiLicense: possuiLicense, possuiGitignore: possuiGitignore, possuiDocs: Array.isArray(allDocs) && allDocs.length > 0, conduct: possuiConductCode, changelog: possuiChangelog, possuiSrc: findCheck('src'), possuiPublic: findCheck('public'), possuiGovernance: possuiGovernance, possuiArquitetura: possuiArquitetura, possuiRoadmap: possuiRoadmap, possuiDocsFolder: findCheck('docs'),
        detalhes: { readme: findDocContent('readme.md'), changelog: findDocContent('changelog.md'), conduct: findDocContent('code_of_conduct.md'), license: apiLicenseValid ? repo.license.name : null, gitignore: repo.gitignore?.content || null, governance: findDocContent('governance.md'), arquitetura: findDocContent('arquitetura.md') || findDocContent('architecture.md'), roadmap: findDocContent('roadmap.md'), docs: allDocs, },
        Folders: folderChecks,
      };
    });
  }

  async analyzeUserRepos(username: string) {
    const repos = await this.getUserRepos(username); const results: any[] = [];
    for (const repo of repos) {
      const owner = repo.owner.login; const name = repo.name; const defaultBranch = repo.default_branch;
      try {
        let patterns: string[] = ['/']; try { const checklistPath = 'Docs/Milestones/Sprint-05/docsCheck-list.md'; const chkRes = await this.http.axiosRef.get(`https://api.github.com/repos/${owner}/${name}/contents/${encodeURIComponent(checklistPath)}?ref=${encodeURIComponent(defaultBranch)}`, { headers: { ...this.defaultHeaders() } }); const chkContent = this.decodeBase64(chkRes.data.content); if(chkContent) { const lines = chkContent.split(/\r?\n/); const tableLines = lines.filter(l => l.includes('|') && !/^\s*\|?[-\s:|]+\|?\s*$/.test(l)); const items: string[] = []; for (const tl of tableLines) { const parts = tl.split('|').map(s => s.trim()); const first = parts.find(p => p.length > 0); if (first && !/^Documento|^Item/i.test(first)) items.push(first.replace(/`/g, '').trim()); } const parsedPatterns = Array.from(new Set(items)).filter(Boolean); if (parsedPatterns.length > 0) patterns = parsedPatterns; } } catch { /* ignora */ }
        const [ commitsSettled, issuesSettled, releasesSettled, readmeSettled, changelogSettled, licenseSettled, contributingSettled, conductSettled, gitignoreSettled, docsListSettled, checkFoldersSettled ] = await Promise.allSettled([
          this.getCommits(owner, name), this.getIssues(owner, name), this.getReleases(owner, name), this.getReadme(owner, name), this.getChangelog(owner, name), this.getLicenses(owner, name), this.getContributing(owner, name), this.getConductCode(owner, name), this.getGitignore(owner, name), this.getDocs(owner, name), this.checkFolders(owner, name)
        ]);
        const { patternResults, resultsByPath, summary } = await this.fetchChecklistMdFiles(owner, name, patterns, defaultBranch);
        const docsContentArray = Object.values(resultsByPath).map(r => ({ name: path.basename(r.path), content: r.content, path: r.path, skipped: r.skipped }));
        results.push({
          repo: name, commits: commitsSettled.status === 'fulfilled' ? commitsSettled.value : [], issues: issuesSettled.status === 'fulfilled' ? issuesSettled.value : [], releases: releasesSettled.status === 'fulfilled' ? releasesSettled.value : [], readme: readmeSettled.status === 'fulfilled' ? readmeSettled.value : { content: null }, changelog: changelogSettled.status === 'fulfilled' ? changelogSettled.value : { content: null }, conductcode: conductSettled.status === 'fulfilled' ? conductSettled.value : { content: null }, license: licenseSettled.status === 'fulfilled' ? licenseSettled.value : { name: 'Unlicensed' }, gitignore: gitignoreSettled.status === 'fulfilled' ? gitignoreSettled.value : { content: null }, docs: docsListSettled.status === 'fulfilled' ? docsListSettled.value : [], contributing: contributingSettled.status === 'fulfilled' ? contributingSettled.value : { content: null }, docsContent: docsContentArray || [], checkFolders: checkFoldersSettled.status === 'fulfilled' ? checkFoldersSettled.value : [], checklistSummary: summary, checklistMatches: patternResults,
        });
      } catch (err: any) { this.logger.warn(`analyzeUserRepos per-repo error ${owner}/${name}: ${err?.message || err}`); results.push({ repo: name, commits:[], issues:[], releases:[], readme:{content:null}, changelog:{content:null}, conductcode:{content:null}, license:{name:'Unlicensed'}, gitignore:{content:null}, docs:[], contributing:{content:null}, docsContent:[], checkFolders:[] }); } // Placeholder mais completo
    }
    return this.formatRepoData(results);
  }
}