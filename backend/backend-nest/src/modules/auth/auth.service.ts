import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import * as bcrypt from 'bcrypt';
import { CreateUserBody } from "src/dtos/create-user.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class authService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async register(body: CreateUserBody) {
        const { email, name, lastName, password } = body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await this.prisma.user.create({
            data: {
                name,
                lastName,
                email,
                password: hashedPassword,
            },
        });

        // Exclude password from returned user object
        const { password: _password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(email: string, password: string) {
        //1. procurar usuario
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        // 2. Comparar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        // 3. Gerar token JWT
        const payload = { sub: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload);

        return {
            message: "Login realizado com sucesso",
            access_token: token,
        };
    }

    async validateOAuthUser(user: any) {
        // Aqui você pode buscar ou criar o usuário no banco de dados
        // Exemplo simples:
        return user;
    }

    // async loginGithub(user: any) {
    //     const payload = { username: user.username, sub: user.githubId };
    //     return {
    //         access_token: this.jwtService.sign(payload),
    //     };
    // }

    async loginGithub(githubUser: any) {
        let user = await this.prisma.user.findUnique({ where: { email: githubUser.email } });

        // Se o usuário ainda não existe, cria
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: githubUser.email,
                    usernameGit: githubUser.username,
                    githubId: githubUser.providerId,
                    provider: 'github',
                }
            });
        }

        // Gera token JWT
        // const payload = { sub: user.id, email: user.email };
        // const access_token = this.jwtService.sign(payload);
        // return { access_token, user };

        const payload = {sub: user.id, email: user.email};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token); // retorna payload decodificado
        } catch (error) {
            return null; // inválido ou expirado
        }
    }

}