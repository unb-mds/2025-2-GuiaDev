import { Body, Controller, Get, Param, Post, Logger, HttpException,HttpStatus} from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {

    private readonly logger = new Logger(GithubController.name);
    constructor(private readonly githubService: GithubService) {}
    
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
    async analyzeUserRepos(@Param('username') username: string) {
        try {
        this.logger.log(`Iniciando análise para o usuário: ${username}`);
        const analysisResults = await this.githubService.analyzeUserRepos(username);
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

    @Get('tree/:owner/:repo')
    async getRepoTree(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getRepoTree(owner, repo);
    }

}
