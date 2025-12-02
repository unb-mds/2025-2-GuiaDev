import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { authController } from './auth.controller';
import { authService } from './auth.service';
import { PrismaService } from 'src/database/prisma.service';
import { AuthGuard } from '@nestjs/passport';

// --- MOCKS ---

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  verifyToken: jest.fn(),
  loginGithub: jest.fn(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

// Mock do AuthGuard("jwt")
class MockJwtAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    // Simula um token decodificado
    req.user = { sub: 1 };
    return true;
  }
}

// Mock do AuthGuard("github")
class MockGithubAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    // Simula retorno do GitHub
    req.user = { id: 999, email: 'github@test.com' };
    return true;
  }
}

describe('AuthController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [authController],
      providers: [
        { provide: authService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useClass(MockJwtAuthGuard)
      .overrideGuard(AuthGuard('github'))
      .useClass(MockGithubAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ----------------------------
  // register
  // ----------------------------

  it('POST /auth/register - deve registrar usuário', async () => {
    mockAuthService.register.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '123456' })
      .expect(201);

    expect(res.body).toEqual({ id: 1, email: 'test@test.com' });
  });

  // ----------------------------
  // login
  // ----------------------------

  it('POST /auth/login - deve logar e retornar token', async () => {
    mockAuthService.login.mockResolvedValue({ access_token: 'abc123' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' })
      .expect(200);

    expect(res.body).toEqual({ access_token: 'abc123' });
  });

  // ----------------------------
  // checkToken
  // ----------------------------

  it('POST /auth/checkToken - token válido', async () => {
    mockAuthService.verifyToken.mockReturnValue({
      id: 1,
      email: 'test@test.com',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/checkToken')
      .send({ token: 'validtoken' })
      .expect(201);

    expect(res.body).toEqual({
      valid: true,
      user: { id: 1, email: 'test@test.com' },
    });
  });

  it('POST /auth/checkToken - token inválido', async () => {
    mockAuthService.verifyToken.mockImplementation(() => {
      throw new Error('invalid');
    });

    const res = await request(app.getHttpServer())
      .post('/auth/checkToken')
      .send({ token: 'invalidtoken' })
      .expect(201);

    expect(res.body.valid).toBe(false);
    expect(res.body.message).toBe('Token inválido ou expirado.');
  });

  // ----------------------------
  // profile
  // ----------------------------

  it('GET /auth/profile - deve retornar perfil do usuário autenticado', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hashed',
    });

    const res = await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(200);

    expect(res.body).toEqual({
      message: 'Rota protegida acessada!',
      user: { id: 1, email: 'test@test.com' },
    });
  });

  // ----------------------------
  // github login redirection
  // ----------------------------

  it('GET /auth/github - apenas garante que rota existe', async () => {
    await request(app.getHttpServer()).get('/auth/github').expect(200);
  });

  it('GET /auth/github/callback - deve redirecionar com token', async () => {
    mockAuthService.loginGithub.mockResolvedValue({ access_token: 'token123' });

    const res = await request(app.getHttpServer())
      .get('/auth/github/callback')
      .expect(302);

    expect(res.header.location).toContain('token=token123');
  });
});
