import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserController } from './user.controller';
import { PrismaService } from 'src/database/prisma.service';
import { AuthGuard } from '@nestjs/passport';

const mockPrisma = {
  user: {
    update: jest.fn(),
  },
};

class MockJwtAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 1 };
    return true;
  }
}

describe('UserController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useClass(MockJwtAuthGuard)
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

  it('POST /user/create - deve retornar mensagem de criação', async () => {
    const res = await request(app.getHttpServer())
      .post('/user/create')
      .expect(201);

    expect(res.text).toBe('você fez get em um usuário');
  });

  it('PATCH /user/userUpdate - deve atualizar usuário autenticado', async () => {
    mockPrisma.user.update.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      usernameGit: 'newuser',
      password: 'hashed',
    });

    const res = await request(app.getHttpServer())
      .patch('/user/userUpdate')
      .send({ usernameGit: 'newuser' })
      .expect(200);

    expect(res.body).toEqual({ id: 1, email: 'test@test.com', usernameGit: 'newuser' });
  });
});
