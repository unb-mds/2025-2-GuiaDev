import { Module } from "@nestjs/common";
import { authController } from "./auth.controller";
import { authService } from "./auth.service";
import { PrismaService } from "src/database/prisma.service";

@Module({
    controllers: [authController],
    providers : [authService, PrismaService],
})
export class authModule{}