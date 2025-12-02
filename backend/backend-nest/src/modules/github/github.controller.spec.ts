import { Test, TestingModule } from '@nestjs/testing';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/axios';
import { DocsAnalyzerService } from './docs-analyzer/docs-analyzer.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CanActivate } from '@nestjs/common';

const mockPrisma = {
  user: { findUnique: jest.fn() },
  githubCache: { findUnique: jest.fn(), upsert: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
  githubRepoData: { findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
};

const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };

const mockGithub = {
  analyzeUserRepos: jest.fn(),
  getReadme: jest.fn(),
  getContributing: jest.fn(),
  getChangelog: jest.fn(),
  getConductCode: jest.fn(),
  getLicenses: jest.fn(),
  getDocsContent: jest.fn(),
};

const mockDocs = { analyzeMany: jest.fn().mockReturnValue({ analyzed: true }) };

describe('GithubController', () => {
  let controller: GithubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [GithubController],
      providers: [
        { provide: GithubService, useValue: mockGithub },
        { provide: DocsAnalyzerService, useValue: mockDocs },
        { provide: PrismaService, useValue: mockPrisma },
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

  it('analyzeUserReposByUsername - returns data on success', async () => {
    mockGithub.analyzeUserRepos.mockResolvedValue([{ repo: 'a' }]);
    const res = await controller.analyzeUserReposByUsername('someuser');
    expect(mockGithub.analyzeUserRepos).toHaveBeenCalledWith('someuser', false);
    expect(res).toEqual([{ repo: 'a' }]);
  });

  it('analyzeUserReposByUsername - throws 404 HttpException when upstream 404', async () => {
    const err: any = { original: { response: { status: 404 } }, message: 'not found' };
    mockGithub.analyzeUserRepos.mockRejectedValueOnce(err);
    await expect(controller.analyzeUserReposByUsername('nouser')).rejects.toMatchObject({ status: 404 });
  });

  it('analyzeRepoDocs - aggregates docs and calls docs analyzer', async () => {
    mockGithub.getReadme.mockResolvedValue({ name: 'README.md', content: 'r' });
    mockGithub.getContributing.mockResolvedValue({ content: 'c' });
    mockGithub.getChangelog.mockResolvedValue({ content: 'ch' });
    mockGithub.getConductCode.mockResolvedValue({ content: 'cd' });
    mockGithub.getLicenses.mockResolvedValue({ name: 'MIT' });
    mockGithub.getDocsContent.mockResolvedValue([{ name: 'DOC.md', content: 'doc' }]);

    const result = await controller.analyzeRepoDocs('o', 'r');
    expect(mockDocs.analyzeMany).toHaveBeenCalled();
    expect(result).toEqual({ analyzed: true });
  });

  it('analyzeUserRepos (POST) - throws NotFound when user missing or missing usernameGit', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const req: any = { user: { userId: 1 } };
    await expect(controller.analyzeUserRepos(req)).rejects.toThrow();
  });

  it('analyzeUserRepos (POST) - returns summary on success', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, usernameGit: 'u' });
    mockGithub.analyzeUserRepos.mockResolvedValue([{ repo: 'r1' }, { repo: 'r2' }]);
    const req: any = { user: { userId: 1 } };
    const res = await controller.analyzeUserRepos(req);
    expect(res).toHaveProperty('message');
    expect(res.count).toBe(2);
    expect(res.data).toHaveLength(2);
  });
});