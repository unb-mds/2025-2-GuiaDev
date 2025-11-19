import { Controller, Get, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UseGuards, Request, Req, Res } from "@nestjs/common";
import { CreateUserBody } from "src/dtos/create-user.dto";
import { authService } from "./auth.service";
import { LoginDto } from '../../dtos/login.dto';
import { AuthGuard } from "@nestjs/passport";
import type { Response } from 'express';
import { PrismaService } from 'src/database/prisma.service';

import { checkTokenDto } from "src/dtos/check-token.dto";

@Controller("auth")
export class authController {
    constructor(private readonly authService: authService, private readonly prisma: PrismaService) { }

    @Post('register')
    async register(@Body() body: CreateUserBody) {
        const user = await this.authService.register(body)

        return user
    }

    @HttpCode(HttpStatus.OK) // 200 em vez de 201
    @Post("login")
    async login(@Body() body: LoginDto) {
        const { email, password } = body;
        return this.authService.login(email, password);
    }



    @Post("checkToken")
    checkToken(@Body() body: checkTokenDto) {
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

    @UseGuards(AuthGuard("jwt"))
    @Get("profile")
    async getProfile(@Request() req) {
        
        const userId = req.user?.sub ?? req.user?.id ?? req.user?.userId;
        if (!userId) {
            return { message: "Token válido, mas id do usuário não encontrado no payload", user: req.user };
        }

        const user = await this.prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) return { message: 'Usuário não encontrado' };

        const { password, ...safe } = user;
        return { message: "Rota protegida acessada!", user: safe };
    }

    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubLogin() {
        // Redireciona o usuário para o GitHub
    }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubCallback(@Req() req, @Res() res: Response) {
        const token = await this.authService.loginGithub(req.user);

        // Redireciona o navegador para o front com o token
        return res.redirect(`http://localhost:3001/home?token=${token.access_token}`);
    }

}