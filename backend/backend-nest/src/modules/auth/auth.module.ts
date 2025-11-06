import { Module } from "@nestjs/common";
import { authController } from "./auth.controller";
import { authService } from "./auth.service";
import { PrismaService } from "src/database/prisma.service";
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from "./jwt.strategy";
import { GithubStrategy } from './github.strategy';

@Module({
    imports: [
    PassportModule.register({ defaultStrategy: 'github' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "segredo_super_secreto", // ideal usar env
      signOptions: { expiresIn: "1h" },
    }),
  ],
    controllers: [authController],
    providers : [authService, PrismaService, JwtStrategy, GithubStrategy],
    exports: [authService],
})
export class authModule{}

