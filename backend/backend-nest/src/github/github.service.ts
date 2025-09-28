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
}
