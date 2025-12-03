import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserBody } from 'src/dtos/create-user.dto';
import { authService } from './auth.service';
import { LoginDto } from '../../dtos/login.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import { checkTokenDto } from 'src/dtos/check-token.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class authController {
  constructor(
    private readonly authService: authService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta no sistema.',
  })
  @ApiBody({ type: CreateUserBody })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.',
  })
  async register(@Body() body: CreateUserBody) {
    const user = await this.authService.register(body);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Login do usuário',
    description: 'Autentica o usuário e retorna um token JWT.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso.',
    schema: {
      example: {
        access_token: 'jwt_token_aqui',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
  })
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('checkToken')
  @ApiOperation({
    summary: 'Validar token JWT',
    description: 'Verifica se o token enviado ainda é válido.',
  })
  @ApiBody({ type: checkTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Resultado da verificação do token.',
    schema: {
      example: {
        valid: true,
        user: { id: 1, email: 'user@teste.com' },
      },
    },
  })
  async checkToken(@Body() body: checkTokenDto) {
    const { token } = body;
    try {
      const decoded = this.authService.verifyToken(token);
      return {
        valid: true,
        user: decoded,
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Token inválido ou expirado.',
      };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({
    summary: 'Obter perfil do usuário autenticado',
    description: 'Retorna os dados do usuário autenticado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
  })
  async getProfile(@Request() req) {
    const userId = req.user?.sub ?? req.user?.id ?? req.user?.userId;
    if (!userId) {
      return {
        message: 'Token válido, mas id do usuário não encontrado no payload',
        user: req.user,
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) return { message: 'Usuário não encontrado' };

    const { password, ...safe } = user;
    return { message: 'Rota protegida acessada!', user: safe };
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'Login via GitHub',
    description:
      'Redireciona o usuário para o fluxo de autenticação do GitHub.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para o GitHub.',
  })
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'Callback do GitHub',
    description:
      'Recebe os dados do GitHub, gera um token JWT e redireciona para o front-end.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redireciona para o front-end com o token.',
  })
  async githubCallback(@Req() req, @Res() res: Response) {
    const token = await this.authService.loginGithub(req.user);

    // Redireciona o navegador para o front com o token
    // return res.redirect(`http://localhost:3001/home?token=${token.access_token}`);//front
    return res.redirect(
      `https://two025-2-guiadev-1-frontend.onrender.com/home?token=${token.access_token}`,
    );
  }
}
