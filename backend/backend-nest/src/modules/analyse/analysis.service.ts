import { Injectable } from '@nestjs/common';
import { GithubService } from 'src/modules/github/github.service'; 
import { AiService } from './ai.service';     

@Injectable()
export class AnalysisService {
  constructor(
    private readonly githubService: GithubService,
    private readonly aiService: AiService,
  ) {}

  // O checklist que a IA vai usar para a análise
  private readonly documentationChecklist = [
    { id: "readme", descricao: "O projeto possui um README com conteúdo claro e informativo." },
    { id: "contributing", descricao: "Existe um guia de contribuição (CONTRIBUTING.md) para desenvolvedores." },
    { id: "license", descricao: "O repositório possui um arquivo de licença (LICENSE)." },
    { id: "code_of_conduct", descricao: "Há um código de conduta (CODE_OF_CONDUCT.md) para a comunidade." },
    { id: "changelog", descricao: "Existe um CHANGELOG.md para rastrear as mudanças nas versões." },
    { id: "gitignore", descricao: "O repositório utiliza um arquivo .gitignore para ignorar arquivos desnecessários." }
  ];

  async analyzeSingleRepo(owner: string, repo: string) {
    // 1. Buscando SÓ OS DADOS RELEVANTES para a IA usando seu GithubService
    const [readme, contributing, license, conduct, changelog, gitignore] = await Promise.all([
      this.githubService.getReadme(owner, repo),
      this.githubService.getContributing(owner, repo),
      this.githubService.getLicenses(owner, repo),
      this.githubService.getConductCode(owner, repo),
      this.githubService.getChangelog(owner, repo),
      this.githubService.getGitignore(owner, repo),
    ]);

    // 2. Montando um objeto SIMPLES com os dados para a IA
    const repoDocsPayload = {
      readme: readme.content,
      contributing: contributing.content,
      license: license?.fileName ? `Licença encontrada: ${license.name}` : null,
      code_of_conduct: conduct.content,
      changelog: changelog.content,
      gitignore: gitignore.content,
    };

    // 3. Enviando o payload para o AiService
    const analysisResult = await this.aiService.analyzeDocumentation(
      repoDocsPayload,
      this.documentationChecklist,
    );

    return {
      repository: `${owner}/${repo}`,
      analysis: analysisResult,
    };
  }
}