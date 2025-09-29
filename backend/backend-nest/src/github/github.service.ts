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

    private GithubUrl(url: string){
        const regex = /github\.com\/([^/]+)\/([^/]+)/;
        const match = url.match(regex);

        if(!match){
            throw Error('URL invaldia');
        }
        return{
            owner: match[1],
            repo: match[2],
        };
    }

    async AnalyzeRepo(url: string){
        const { owner, repo } = this.GithubUrl(url);
        const commits = await this.getCommits(owner, repo);
        const issues = await this.getIssues(owner, repo);
        const releases = await this.getReleases(owner, repo);

        return{ commits, issues, releases };
    }
}
