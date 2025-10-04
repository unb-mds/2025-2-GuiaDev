import { Injectable} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Buffer } from 'buffer';

@Injectable()
export class GithubService {
    constructor(private readonly http: HttpService) {}

    private token = process.env.GITHUB_TOKEN;

    async getUserRepos(username: string){
        const url = `https://api.github.com/users/${username}/repos`;

        const response = await this.http.axiosRef.get(url, {
            headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
            },
        });
        return response.data.map(repo => ({
            name: repo.name,
            owner: repo.owner.login,
            url: repo.html_url,
        }));
    }

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

/** 

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
**/
 
    async getReadme(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
        
        try{
            const response = await this.http.axiosRef.get(url,{
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github+json',
                },
            });
            const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

            return {
                name: response.data.name,
                content: decodedContent,
            };
        }
        catch (error) {
            if(error.response?.status === 500){
                return {
                    name: 'README.md',
                    content: null,
                };
            }
            throw error;
        }   
    }

    async analyzeUserRepos(username: string) {
        const repos = await this.getUserRepos(username);

        const results: any[] = [];

        for (const repo of repos) {
            const commits = await this.getCommits(repo.owner.login, repo.name);
            const issues = await this.getIssues(repo.owner.login, repo.name);
            const releases = await this.getReleases(repo.owner.login, repo.name);
            const readme = await this.getReadme(repo.owner.login, repo.name)

            results.push({
              repo: repo.name,
              commits,
              issues,
              releases,
              readme,
              });
        }   

        return results;
    }
}
