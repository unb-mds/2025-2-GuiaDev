import { UseGuards, Req, Body, Controller, Get, Param, Post, Logger, HttpException, HttpStatus, NotFoundException, Put } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Request } from 'express';
import { DocsAnalyzerService } from './docs-analyzer/docs-analyzer.service';

interface RequestWithUser extends Request {
  user: {
      userId: number;
  };
}

@Controller('github')
export class GithubController {

    private readonly logger = new Logger(GithubController.name);
    constructor(private readonly githubService: GithubService, private readonly prisma: PrismaService, private readonly docsAnalyzeService: DocsAnalyzerService) {}

    
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
        const [readme, contributing, changelog, conduct, license, docsContent] = await Promise.all([
            this.githubService.getReadme(owner, repo).catch(() => ({ name: 'README.md', content: null })),
            this.githubService.getContributing(owner, repo).catch(() => ({ content: null })),
            this.githubService.getChangelog(owner, repo).catch(() => ({ content: null })),
            this.githubService.getConductCode(owner, repo).catch(() => ({ content: null })),
            this.githubService.getLicenses(owner, repo).catch(() => ({ name: null })),
            this.githubService.getDocsContent(owner, repo).catch(() => []),
        ]);

        const docs: { name: string; content: string | null }[] = [];
        docs.push({ name: readme?.name || 'README.md', content: readme?.content ?? null });
        docs.push({ name: 'CONTRIBUTING.md', content: contributing?.content ?? null });
        docs.push({ name: 'CHANGELOG.md', content: changelog?.content ?? null });
        docs.push({ name: 'CODE_OF_CONDUCT.md', content: conduct?.content ?? null });
        docs.push({ name: 'LICENSE', content: license?.name ?? null });

        if (Array.isArray(docsContent)) {
            for (const d of docsContent) {
                docs.push({ name: d.name, content: d.content ?? null });
            }
        }

        const analysis = this.docsAnalyzeService.analyzeMany(docs); //verificar isso
        return analysis;
    }

    @Get('tree/:owner/:repo')
    async getRepoTree(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getRepoTree(owner, repo);
    }

    @Put('analyze/:owner/:repo/refresh-score')
    @UseGuards(JwtAuthGuard)
    async refreshScore(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.forceUpdateAnalysis(owner, repo);
  }


    @Post('analyze') 
    @UseGuards(JwtAuthGuard) 
    async analyzeUserRepos(
        @Req() req: RequestWithUser,
        @Body() body: { username?: string } 
    ) {
    
        let usernameToAnalyze = body.username;

        if (!usernameToAnalyze) {
            const userId = req.user.userId;
            const user = await this.prisma.user.findUnique({
                where: { id: Number(userId) },
            });
            
            if (user?.usernameGit) {
                usernameToAnalyze = user.usernameGit;
            }
        }

        if (!usernameToAnalyze) {
            throw new NotFoundException(
                'Username do GitHub não fornecido e não configurado no perfil.',
            );
        }

        try {
            const analysisResults = await this.githubService.analyzeUserRepos(
                usernameToAnalyze,
                true 
            );
            
            return {
                message: `Análise de ${usernameToAnalyze} concluída.`,
                count: analysisResults.length,
                data: analysisResults,
            };

        } catch (error: any) {

            if (error?.original?.response?.status === 404) {
                throw new HttpException(
                `Usuário do GitHub "${usernameToAnalyze}" não foi encontrado.`,
                HttpStatus.NOT_FOUND,
                );
            }
            
            throw new HttpException(
                'Falha ao buscar dados do GitHub.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}