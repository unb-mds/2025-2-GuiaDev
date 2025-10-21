import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GithubService } from './github.service';
import { DocsAnalyzerService } from './docs-analyzer/docs-analyzer.service';

@Controller('github')
export class GithubController {
    constructor(
        private readonly githubService: GithubService,
        private readonly docsAnalyzer: DocsAnalyzerService,
    ) {}
    
    @Get('commits/:owner/:repo')
    async getCommits(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getCommits(owner,repo);
    }

    @Get('issues/:owner/:repo')
    async getIssues(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getIssues(owner,repo);
    }

    @Get('releases/:owner/:repo')
    async getReleases(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getReleases(owner,repo);
    }

    @Get('readme/:owner/:repo')
    async getReadme(@Param('owner') owner: string, @Param('repo') repo: string){
        return this.githubService.getReadme(owner,repo);
    }
    
/** 
    @Post('analyze')
    async analyzeRepo(@Body('url') url: string) {
        return this.githubService.AnalyzeRepo(url);
    }
**/

    @Get('licenses/:owner/:repo')
    async getLicenses(@Param('owner') owner: string, @Param('repo') repo: string){
        return this.githubService.getLicenses(owner,repo);
    }
    
    @Get('gitignore/templates/:owner/:repo')
    async getGitignore(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getGitignore(owner, repo);
    }

    @Get('changelog/:owner/:repo')
    async getChangelog(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getChangelog(owner, repo);
    }

    @Get('contributing/:owner/:repo')
    async getContributing(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getContributing(owner, repo);
    }

    @Get('conductcode/:owner/:repo')
    async getConductCode(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getConductCode(owner, repo);
    }

    @Get('docs/:owner/:repo')
    async getDocs(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getDocs(owner, repo);
    }

    @Get('content/docs/:owner/:repo')
    async getDocsContent(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getDocsContent(owner, repo);
    }

    @Get('analyze/user/:username')
    async analyzeUserRepos(@Param('username') username: string) {
    return this.githubService.analyzeUserRepos(username);
    }

    @Get('analyze/:owner/:repo')
    async analyzeRepoDocs(@Param('owner') owner: string, @Param('repo') repo: string) {
        // Gather docs que o serviço pode buscar
        const [readme, contributing, changelog, conduct, license, docsContent] = await Promise.all([
            this.githubService.getReadme(owner, repo).catch(() => ({ name: 'README.md', content: null })),
            this.githubService.getContributing(owner, repo).catch(() => ({ content: null })),
            this.githubService.getChangelog(owner, repo).catch(() => ({ content: null })),
            this.githubService.getConductCode(owner, repo).catch(() => ({ content: null })),
            this.githubService.getLicenses(owner, repo).catch(() => ({ name: null })),
            this.githubService.getDocsContent(owner, repo).catch(() => []),
        ]);

        // constrói o array de documentos
        const docs: { name: string; content: string | null }[] = [];
        docs.push({ name: readme?.name || 'README.md', content: readme?.content ?? null });
        docs.push({ name: 'CONTRIBUTING.md', content: contributing?.content ?? null });
        docs.push({ name: 'CHANGELOG.md', content: changelog?.content ?? null });
        docs.push({ name: 'CODE_OF_CONDUCT.md', content: conduct?.content ?? null });
        docs.push({ name: 'LICENSE', content: license?.name ?? null });

        // adiciona arquivos da pasta docs/
        if (Array.isArray(docsContent)) {
            for (const d of docsContent) {
                docs.push({ name: d.name, content: d.content ?? null });
            }
        }

        const analysis = this.docsAnalyzer.analyzeMany(docs);
        return analysis;
    }

}
