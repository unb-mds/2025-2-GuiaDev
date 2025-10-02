import { Controller, Get, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, UseGuards, Request } from "@nestjs/common";
import { CreateUserBody } from "src/dtos/create-user.dto";
import { authService } from "./auth.service";
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class authController {
    constructor(private readonly authService: authService){}

    

    @Post('register')
    async register(@Body() body: CreateUserBody){
        const user = await this.authService.register(body)

        return user
    }

    @HttpCode(HttpStatus.OK) // 200 em vez de 201
  @Post("login")
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

    @Get()
    getUser(){
        return this.authService.getUser();
    }

    @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  getProfile(@Request() req) {
    return { message: "Rota protegida acessada!", user: req.user };
  }
}