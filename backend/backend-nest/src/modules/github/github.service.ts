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
            owner: { login: repo.owner.login },
            url: repo.html_url,
        }));
    }

    async getCommits(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/commits`;

        try{
            const response = await this.http.axiosRef.get(url, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github+json',
            },
            });

            return response.data.map ((c) => c.commit.message);
        } 
        catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    content: null,
                };
            }
        }
    }
    
    async getIssues(owner: string, repo:string){
        const url = `https://api.github.com/repos/${owner}/${repo}/issues`;

        try{
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
        catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    content: null
                };
            }
        }
    }
    
    async getReleases(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
        
        try{
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
        catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    content: null
                };
            }
        }    
    }

/** 
 * se der bo eu volto pra esse

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
            if(error.response?.status === 404){
                return {
                    name: 'README.md',
                    content: null,
                };
            }
            throw error;
        }   
    }

    async getLicenses(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/license`;

        try{
            const response = await this.http.axiosRef.get(url,{
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github+json',
                },
            });

            const licenseData = response.data;

            return {
                name: licenseData.license.name,
                key: licenseData.key,
                fileName: licenseData.name ,
            };
        } 
        catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    name: 'Unlicensed',
                    key: 'unlicensed',
                    fileName: null,
                };
            }
        }
    }

    async getGitignore(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/.gitignore`;
        
        try{
            const response = await this.http.axiosRef.get(url,{
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github+json',
                },
            });
            const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

            const filedata = response.data;

            return {
                content: decodedContent,
                sha: filedata,
            };
        }
        catch (error) {
            if(error.response?.status === 404){
                return {
                    content: null,
                };
            }
            throw error;
        }   
    }    

    async getChangelog(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/CHANGELOG.md`;
        
        try{
            const response = await this.http.axiosRef.get(url,{
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github+json',
                },
            });
            const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

            const filedata = response.data;

            return {
                content: decodedContent,
                sha: filedata,
            };
        }
        catch (error) {
            if(error.response?.status === 404){
                return {
                    content: null,
                };
            }
            throw error;
        }   
    } 

    async getContributing(owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/CONTRIBUTING.md`;
        
        try{
            const response = await this.http.axiosRef.get(url,{
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github+json',
                },
            });
            const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

            const filedata = response.data;

            return {
                content: decodedContent,
                sha: filedata,
            };
        }
        catch (error) {
            if(error.response?.status === 404){
                return {
                    content: null,
                };
            }
            throw error;
        }   
    } 

    async getConductCode (owner: string, repo: string){
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/CODE_OF_CONDUCT.md`;
        
        try{
            const response = await this.http.axiosRef.get(url,{
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github+json',
                },
            });
            const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

            const filedata = response.data;

            return {
                content: decodedContent,
                sha: filedata,
            };
        }
        catch (error) {
            if(error.response?.status === 404){
                return {
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
            const owner = repo.owner.login;
            const name = repo.name;

            const [commits, issues, releases, readme] = await Promise.allSettled([
                this.getCommits(owner, name),
                this.getIssues(owner, name),
                this.getReleases(owner, name),
                this.getReadme(owner, name),
            ]);

            results.push({       //essa bomba ai serve pra evitar error 500 e 404
            repo: name,
            commits: commits.status === 'fulfilled' ? commits.value : [],
            issues: issues.status === 'fulfilled' ? issues.value : [],
            releases: releases.status === 'fulfilled' ? releases.value : [],
            readme: readme.status === 'fulfilled' ? readme.value : { content: null },
            });

        }

        return results;
    }

}
