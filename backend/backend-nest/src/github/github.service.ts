import { Injectable} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GithubService {
    constructor(private readonly http: HttpService) {}

    private token = process.env.GITHUB_TOKEN;

    async getCommits(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/commits`;

        const response = await this.http.axiosRef.get(url, {
        headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
        },
        });


        return response.data.map ((c) => c.commit.message);
    }
    
    async getIssues(owner: string, repo:string){
        const url = `https://api.github.com/repos/${owner}/${repo}/issues`;

        const response = await this.http.axiosRef.get(url,{
        headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
        },
        });

        return response.data.map(issue => ({
            number: issue.number,
            title: issue.title,
            state: issue.state,
            user: issue.user.login,
            body: issue.body,
        }));
    }
    
    async getReleases(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
        
        const response = await this.http.axiosRef.get(url, {
        headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
        },
        });
        
        return response.data.map(release => ({
            name: release.name,
            tag: release.tag_name,
            published_at: release.published_at,
        }));
    }
}
