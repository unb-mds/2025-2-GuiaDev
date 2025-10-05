import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
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

    @Get('analyze/user/:username')
    async analyzeUserRepos(@Param('username') username: string) {
    return this.githubService.analyzeUserRepos(username);
    }

}
