import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail válido do usuário para autenticação.',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário. Deve conter no mínimo 6 caracteres.',
    example: 'mySecret123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
