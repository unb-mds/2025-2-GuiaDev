import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import * as bcrypt from 'bcrypt';
import { CreateUserBody } from "src/dtos/create-user.dto";
// import { randomUUID } from "crypto";

@Injectable()
export class authService{
    constructor(private prisma : PrismaService){}

    async register(body : CreateUserBody){
        const {email, name, lastName, password} = body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await this.prisma.user.create({
        data: {
            // id: randomUUID(),
            name,
            lastName,
            email,
            password: hashedPassword,
        },
        });

        return user;
    }

}