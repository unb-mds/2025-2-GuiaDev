import { Test, TestingModule } from '@nestjs/testing';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/axios';
import { DocsAnalyzerService } from './docs-analyzer/docs-analyzer.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CanActivate } from '@nestjs/common';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  githubCache: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  githubRepoData: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };

describe('GithubController', () => {
  let controller: GithubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [GithubController],
      providers: [
        GithubService,
        DocsAnalyzerService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockAuthGuard)
    .compile();

    controller = module.get<GithubController>(GithubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});