import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';


@Controller('user')
export class UserController {
    constructor(private prisma : PrismaService){}

    @Post('create')
    async createUser() {

        return "você fez get em um usuário"
    }

}