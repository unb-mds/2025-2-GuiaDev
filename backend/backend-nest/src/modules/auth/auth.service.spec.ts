import { Test, TestingModule } from '@nestjs/testing';
import { authService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mocks das dependências externas
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
};

// Mockando o bcrypt 
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: authService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        authService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<authService>(authService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);

    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um usuário e retornar os dados sem a senha', async () => {
      const createUserDto = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'securePassword',
      };

      // Simula o hash do bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      
      // Simula o retorno do Prisma 
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id-1',
        ...createUserDto,
        password: 'hashedPassword123',
      });

      const result = await service.register(createUserDto);

      // Verificações
      expect(bcrypt.hash).toHaveBeenCalledWith('securePassword', 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('password'); // Garante que a senha foi removida
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-id-1',
      email: 'john@example.com',
      password: 'hashedPassword123',
    };

    it('deve retornar um token de acesso quando as credenciais são válidas', async () => {
      // Configura os mocks para sucesso
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mocked_token_jwt');

      const result = await service.login('john@example.com', 'plainPassword');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', mockUser.password);
      expect(result).toEqual({
        message: 'Login realizado com sucesso',
        access_token: 'mocked_token_jwt',
      });
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login('wrong@email.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Senha errada

      await expect(service.login('john@example.com', 'wrongPass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('loginGithub', () => {
    const githubUser = {
      email: 'git@example.com',
      username: 'gituser',
      providerId: '12345',
    };

    it('deve fazer login (gerar token) se o usuário já existe', async () => {
      const existingUser = { id: 'user-1', email: 'git@example.com' };
      
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue('github_token');

      const result = await service.loginGithub(githubUser);

      expect(prisma.user.create).not.toHaveBeenCalled(); // Não deve criar novo
      expect(result).toEqual({ access_token: 'github_token' });
    });

    it('deve criar um novo usuário e gerar token se ele não existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null); // Não existe
      const newUser = { id: 'new-user', email: 'git@example.com' };
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('new_github_token');

      const result = await service.loginGithub(githubUser);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: githubUser.email,
          usernameGit: githubUser.username,
          githubId: githubUser.providerId,
          provider: 'github',
        },
      });
      expect(result).toEqual({ access_token: 'new_github_token' });
    });
  });

  describe('verifyToken', () => {
    it('deve retornar o payload se o token for válido', async () => {
      const payload = { sub: '123', email: 'test@test.com' };
      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.verifyToken('valid_token');
      expect(result).toEqual(payload);
    });

    it('deve retornar null se o token for inválido', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = await service.verifyToken('invalid_token');
      expect(result).toBeNull();
    });
  });
});