import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { DocsAnalyzerService } from './docs-analyzer/docs-analyzer.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GithubService, DocsAnalyzerService],
  controllers: [GithubController],
})
export class GithubModule {}
