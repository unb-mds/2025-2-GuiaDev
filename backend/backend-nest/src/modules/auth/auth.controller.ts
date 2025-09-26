import { Controller, Post } from "@nestjs/common";
import { CreateUserBody } from "src/dtos/create-user.dto";
import { Body } from "@nestjs/common";
import { authService } from "./auth.service";

@Controller("auth")
export class authController {
    constructor(private readonly authService: authService){}

    @Post('register')
    async register(@Body() body: CreateUserBody){
        const user = await this.authService.register(body)

        return user
    }
}