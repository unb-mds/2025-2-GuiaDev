import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

// validar os dados de entrada
class AnalyzeRepoDto {
  owner: string;
  repo: string;
}

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('/repo')
  async analyzeRepository(@Body() body: AnalyzeRepoDto) {
    const { owner, repo } = body;
    return this.analysisService.analyzeSingleRepo(owner, repo);
  }
}