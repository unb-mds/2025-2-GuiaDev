import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateUserDto } from 'src/dtos/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private prisma: PrismaService) {}

  @Post('create')
  async createUser() {
    return 'você fez get em um usuário';
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('userUpdate')
  async updateUser(@Req() req, @Body() body: UpdateUserDto) {
    const userIdRaw = req.user?.sub ?? req.user?.id ?? req.user?.userId;
    if (!userIdRaw) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const userId = Number(userIdRaw);
    if (Number.isNaN(userId) || userId <= 0) {
      throw new BadRequestException('ID de usuário inválido');
    }

    const data: any = {};
    if (typeof body.usernameGit !== 'undefined')
      data.usernameGit = body.usernameGit;

    // Cast to any to avoid TS typing issues when Prisma client types are not picked up
    const update = await (this.prisma as any).user.update({
      where: { id: userId },
      data,
    });

    const { password, ...userWithoutPassword } = update;
    return userWithoutPassword;
  }
}
