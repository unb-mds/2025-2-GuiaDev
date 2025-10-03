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
/** 
    @Post('analyze')
    async analyzeRepo(@Body('url') url: string) {
        return this.githubService.AnalyzeRepo(url);
    }
**/
    @Get('analyze/user/:username')
    async analyzeUser(@Param('username') username: string) {
    return this.githubService.analyzeUserRepos(username);
    }

}
