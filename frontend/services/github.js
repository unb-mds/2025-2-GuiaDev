import api from './api';

async function safeGet(path) {
  try {
    const res = await api.get(path);
    return res.data;
  } catch (err) {
    // return null on 404 to simplify UI handling; rethrow otherwise
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function getReadme(owner, repo) {
  return safeGet(`github/readme/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getCommits(owner, repo) {
  return safeGet(`github/commits/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getIssues(owner, repo) {
  return safeGet(`github/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getReleases(owner, repo) {
  return safeGet(`github/releases/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getDocs(owner, repo) {
  return safeGet(`github/docs/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getChangelog(owner, repo) {
  return safeGet(`github/changelog/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getGitignore(owner, repo) {
  return safeGet(`github/gitignore/templates/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getLicenses(owner, repo) {
  return safeGet(`github/licenses/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getContributing(owner, repo) {
  return safeGet(`github/contributing/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getConductCode(owner, repo) {
  return safeGet(`github/conductcode/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getArchitecture(owner, repo) {
  return safeGet(`github/architecture/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getGovernance(owner, repo) {
  return safeGet(`github/governance/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getRoadmap(owner, repo) {
  return safeGet(`github/roadmap/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function checkFolders(owner, repo) {
  return safeGet(`github/folder/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getDocsContent(owner, repo) {
  return safeGet(`github/content/docs/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function getRepoTree(owner, repo) {
  return safeGet(`github/tree/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

export async function analyzeUserRepos(username) {
  return safeGet(`github/analyze/user/${encodeURIComponent(username)}`);
}

const GitHubAPI = {
  getReadme,
  getCommits,
  getIssues,
  getReleases,
  getDocs,
  getChangelog,
  getGitignore,
  getLicenses,
  getContributing,
  getConductCode,
  getArchitecture,
  getGovernance,
  getRoadmap,
  checkFolders,
  getDocsContent,
  getRepoTree,
  analyzeUserRepos,
};

export default GitHubAPI;
