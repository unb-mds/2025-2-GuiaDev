import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from 'src/modules/github/github.service';     
import { AiService } from './ai.service';             
import { AnalysisService } from './analysis.service'; 
import { AnalysisController } from './analysis.controller'; 

@Module({
  imports: [HttpModule],
  providers: [
    GithubService, 
    AiService, 
    AnalysisService
  ],
  controllers: [AnalysisController],
})
export class AnalysisModule {}