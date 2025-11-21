import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { DocsAnalyzerService } from './docs-analyzer/docs-analyzer.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../database/prisma.service';
import { authModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [HttpModule, authModule, DocsAnalyzerService],
  providers: [GithubService, PrismaService],
  controllers: [GithubController],
  exports: [GithubService],
})
export class GithubModule {}
