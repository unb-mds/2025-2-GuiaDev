import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
    constructor(private readonly githubService: GithubService) {}
    
    @Get('commits/:owner/:repo')
    async getCommits(@Param('owner') owner: string, @Param('repo') repo: string) {
        return this.githubService.getCommits(owner,repo);
    }
}
