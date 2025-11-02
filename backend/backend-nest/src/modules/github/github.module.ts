import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [HttpModule],
  providers: [GithubService, PrismaService],
  controllers: [GithubController],
  exports: [GithubService],
})
export class GithubModule {}
