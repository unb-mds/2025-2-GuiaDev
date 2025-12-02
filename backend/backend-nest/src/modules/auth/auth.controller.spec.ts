import { Test, TestingModule } from '@nestjs/testing';
import { authController } from './auth.controller';
import { authService } from './auth.service';
import { CreateUserBody } from 'src/dtos/create-user.dto';
import { LoginDto } from '../../dtos/login.dto';
import { checkTokenDto } from 'src/dtos/check-token.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: authController;
  let service: authService;

  //  Mock do Service
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyToken: jest.fn(),
    loginGithub: jest.fn(),
  };

  //  Mock do Response do Express (para o redirecionamento)
  const mockResponse = {
    redirect: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [authController],
      providers: [
        {
          provide: authService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<authController>(authController);
    service = module.get<authService>(authService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um novo usuário', async () => {
      const dto: CreateUserBody = {
        name: 'Teste',
        lastName: 'User',
        email: 'teste@email.com',
        password: '123',
      };
      const resultUser = { id: '1', ...dto };
      // Removemos a senha do resultado esperado
      delete (resultUser as any).password;

      mockAuthService.register.mockResolvedValue(resultUser);

      const result = await controller.register(dto);

      expect(result).toEqual(resultUser);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('deve retornar o token de login', async () => {
      const dto: LoginDto = { email: 'teste@email.com', password: '123' };
      const expectedResponse = { 
        message: 'Login realizado com sucesso', 
        access_token: 'jwt_token' 
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('checkToken', () => {
    it('deve retornar valid: true se o token for verificado com sucesso', () => {
      const dto: checkTokenDto = { token: 'valid_token' };
      const decodedPayload = { sub: '1', email: 'test@test.com' };

      // Simula sucesso na verificação
      mockAuthService.verifyToken.mockReturnValue(decodedPayload);

      const result = controller.checkToken(dto);

      expect(service.verifyToken).toHaveBeenCalledWith('valid_token');
      expect(result).toEqual({
        valid: true,
        user: decodedPayload,
      });
    });

    it('deve retornar valid: false se o verifyToken lançar erro', () => {
      const dto: checkTokenDto = { token: 'invalid_token' };

      // Simula erro no service para cair no catch do controller
      mockAuthService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = controller.checkToken(dto);

      expect(result).toEqual({
        valid: false,
        message: 'Token inválido ou expirado.',
      });
    });
  });

  describe('getProfile', () => {
    it('deve retornar a mensagem e o usuário da requisição', () => {
      // Simulamos o objeto req que o Guard injetaria
      const req = { user: { id: '1', email: 'test@test.com' } };

      const result = controller.getProfile(req);

      expect(result).toEqual({
        message: 'Rota protegida acessada!',
        user: req.user,
      });
    });
  });

  describe('githubCallback', () => {
    it('deve fazer login pelo github e redirecionar para o frontend com o token', async () => {
      const req = { user: { email: 'git@test.com', username: 'gituser' } };
      const tokenResponse = { access_token: 'github_jwt_token' };

      // Mocka o retorno do loginGithub
      mockAuthService.loginGithub.mockResolvedValue(tokenResponse);

      await controller.githubCallback(req, mockResponse);

      // Verifica se o service foi chamado com o user do request
      expect(service.loginGithub).toHaveBeenCalledWith(req.user);

      // Verifica se o redirecionamento aconteceu para a URL certa      
      const expectedUrl = `https://two025-2-guiadev-1-frontend.onrender.com/home?token=${tokenResponse.access_token}`;
      
      expect(mockResponse.redirect).toHaveBeenCalledWith(expectedUrl);
    });
  });
});