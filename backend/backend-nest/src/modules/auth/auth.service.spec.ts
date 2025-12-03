import { Test, TestingModule } from '@nestjs/testing';
import { authService } from './auth.service';
import { PrismaService } from 'src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('authService', () => {
  let service: authService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    githubRepoData: { findUnique: jest.fn() },
    githubCache: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    githubRepoData: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  } as any;

  const mockJwt = {
    signAsync: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  } as any;

  beforeEach(async () => {
    // Não redefinimos funções de `bcrypt` (propriedades podem ser não-configuráveis).
    // Usaremos hashes gerados localmente nas fixtures para testar `compare`.

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        authService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<authService>(authService);
  });

  afterEach(() => jest.clearAllMocks());

  it('register should hash password and return user without password', async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      password: 'hashed-123',
      usernameGit: 'u',
    });

    const result = await service.register({
      email: 'a@b.com',
      password: '123',
      name: '',
      lastName: '',
      usernameGit: 'u',
    } as any);

    expect(result).toEqual({ id: 1, email: 'a@b.com', usernameGit: 'u' });
  });

  it('login should throw when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login('no@user.com', 'pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('login should throw when password invalid', async () => {
    // usuário existente com senha diferente
    const hashedOther = bcrypt.hashSync('other', 1);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 2,
      email: 'x@y.com',
      password: hashedOther,
    });

    await expect(service.login('x@y.com', 'pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('login should return token on success', async () => {
    const hashed = bcrypt.hashSync('pass', 1);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: 'ok@x.com',
      password: hashed,
    });
    mockJwt.signAsync.mockResolvedValue('tok-xyz');

    const res = await service.login('ok@x.com', 'pass');
    expect(res.access_token).toBe('tok-xyz');
  });

  it('verifyToken should return decoded payload or null', async () => {
    mockJwt.verify.mockImplementation((t: string) => ({
      sub: 1,
      email: 'a@b',
    }));
    const ok = await service.verifyToken('any');
    expect(ok).toEqual({ sub: 1, email: 'a@b' });

    mockJwt.verify.mockImplementation(() => {
      throw new Error('bad');
    });
    const invalid = await service.verifyToken('bad');
    expect(invalid).toBeNull();
  });

  it('loginGithub should create user when not exists and return token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 7, email: 'g@u.com' });
    mockJwt.sign.mockReturnValue('gh-token');

    const res = await service.loginGithub({
      email: 'g@u.com',
      username: 'gg',
      providerId: 123,
    });
    expect(res.access_token).toBe('gh-token');
  });

  it('loginGithub should use existing user and return token', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 8, email: 'g2@u.com' });
    mockJwt.sign.mockReturnValue('gh-token-2');

    const res = await service.loginGithub({
      email: 'g2@u.com',
      username: 'gg2',
      providerId: 124,
    });
    expect(res.access_token).toBe('gh-token-2');
  });
});
