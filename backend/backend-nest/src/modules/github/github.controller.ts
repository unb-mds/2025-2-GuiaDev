import { Controller, Get, Param, Logger, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { GithubService } from './github.service';
import { PrismaService } from 'src/database/prisma.service';
import { DocsAnalyzerService } from './docs-analyzer/docs-analyzer.service';

@Controller('github')
export class GithubController {

    private readonly logger = new Logger(GithubController.name);
    constructor(private readonly githubService: GithubService, private readonly prisma: PrismaService, private readonly docsAnalyzeService: DocsAnalyzerService) {}

    private calculateRepoScore(analysis: Array<{ score?: number }>): number {
        if (!Array.isArray(analysis) || analysis.length === 0) return -1;
        const scores = analysis
            .map((doc) => (typeof doc.score === 'number' ? doc.score : null))
            .filter((value): value is number => value !== null && Number.isFinite(value));
        if (scores.length === 0) return -1;
        const avg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
        return Math.round(avg);
    }

    @Get('commits/:owner/:repo')
    async getCommits(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getCommits(owner,repo);
    }

    @Get('branches/:owner/:repo')
    async getBranches(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getBranches(owner, repo);
    }

    @Get('pulls/:owner/:repo')
    async getPullRequests(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getPullRequests(owner, repo);
    }

    @Get('contributors/:owner/:repo')
    async getContributors(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getContributors(owner, repo);
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
    
    @Get('governance/:owner/:repo')
    async getGovernance(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getGovernance(owner, repo);
    }

    @Get('architecture/:owner/:repo')
    async getArchitecture(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getArchitecture(owner, repo);
    }

    @Get('roadmap/:owner/:repo')
    async getRoadmap(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getRoadmap(owner, repo);
    }

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
    async analyzeUserReposByUsername(@Param('username') username: string) {
        try {
            this.logger.log(`Iniciando análise para o usuário: ${username}`);
            const analysisResults = await this.githubService.analyzeUserRepos(username, false);
            this.logger.log(`Análise concluída para: ${username}`);
            return analysisResults;
        } catch (error: any) {
            this.logger.error(`Falha ao analisar repositórios para ${username}: ${error.message}`, error.stack);

            if (error?.original?.response?.status === 404) {
                throw new HttpException(
                    `Usuário do GitHub "${username}" não encontrado.`,
                    HttpStatus.NOT_FOUND,
                );
            }
            
            throw new HttpException(
                'Falha ao buscar dados do GitHub. Tente novamente mais tarde.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('analyze/:owner/:repo')
    async analyzeRepoDocs(@Param('owner') owner: string, @Param('repo') repo: string) {
        const cached = await this.githubService.getCachedRepoAnalysis(owner, repo);
        let repoEtag: string | null = null;

        try {
            const { changed, etag } = await this.githubService.checkRepoChanged(owner, repo);
            repoEtag = etag ?? null;
            if (!changed && cached?.data && cached?.etag && cached.etag === repoEtag) {
                return cached.data;
            }
        } catch (err) {
            if (cached?.data) {
                return cached.data;
            }
        }

        const [readme, contributing, conduct, license, gitignore, templates] = await Promise.all([
            this.githubService.getReadme(owner, repo).catch(() => ({ name: 'README.md', content: null })),
            this.githubService.getContributing(owner, repo).catch(() => ({ content: null })),
            this.githubService.getConductCode(owner, repo).catch(() => ({ content: null })),
            this.githubService.getLicenses(owner, repo).catch(() => ({ name: null, content: null })),
            this.githubService.getGitignore(owner, repo).catch(() => ({ content: null })),
            this.githubService.getIssueAndPrTemplates(owner, repo).catch(() => []),
        ]);

        const docs: { name: string; content: string | null }[] = [];
        docs.push({ name: readme?.name || 'README.md', content: readme?.content ?? null });
        docs.push({ name: 'CONTRIBUTING.md', content: contributing?.content ?? null });
        docs.push({ name: 'CODE_OF_CONDUCT.md', content: conduct?.content ?? null });
        docs.push({ name: 'LICENSE', content: license?.content ?? null });
        docs.push({ name: '.gitignore', content: gitignore?.content ?? null });

        if (Array.isArray(templates)) {
            for (const template of templates) {
                docs.push({ name: template.name, content: template.content ?? null });
            }
        }

        const analysis = await this.docsAnalyzeService.analyzeMany(docs);
        const repoScore = this.calculateRepoScore(analysis);

        try {
            const cachedRepo = await this.prisma.githubRepoData.findUnique({
                where: { owner_repo: { owner, repo } },
            });

            if (cachedRepo) {
                const currentData = (cachedRepo.data as Record<string, any>) || {};
                const updatedData = {
                    ...currentData,
                    score: repoScore,
                };

                await this.prisma.githubRepoData.update({
                    where: { owner_repo: { owner, repo } },
                    data: { data: updatedData },
                });
            }
        } catch (err: any) {
            this.logger.warn(`Falha ao atualizar score do repositório ${owner}/${repo}: ${err?.message || err}`);
        }

        await this.githubService.saveCachedRepoAnalysis(owner, repo, repoEtag, analysis);

        return analysis;
    }

        @Post('analyze')
        async analyzeUserRepos(@Req() req: any) {
            const userRecord = await this.prisma.user.findUnique({ where: { id: req.user?.userId } });
            if (!userRecord || !userRecord.usernameGit) {
                throw new HttpException('Usuário não encontrado ou sem usernameGit', HttpStatus.NOT_FOUND);
            }

            const results = await this.githubService.analyzeUserRepos(userRecord.usernameGit, false);
            return {
                message: 'Análise concluída',
                count: Array.isArray(results) ? results.length : 0,
                data: results,
            };
        }

    @Get('tree/:owner/:repo')
    async getRepoTree(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getRepoTree(owner, repo);
    }

}
