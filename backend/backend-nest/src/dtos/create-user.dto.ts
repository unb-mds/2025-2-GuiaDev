import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class CreateUserBody {
  @ApiProperty({
    description: 'E-mail válido do usuário. Deve ser único no sistema.',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nome do usuário. Deve conter entre 3 e 50 caracteres.',
    example: 'John',
  })
  @IsNotEmpty({
    message: 'The name should not be empty',
  })
  @Length(3, 50)
  name: string;

  @ApiProperty({
    description: 'Sobrenome do usuário. Deve conter entre 3 e 100 caracteres.',
    example: 'Doe',
  })
  @IsNotEmpty({
    message: 'The last name should not be empty',
  })
  @Length(3, 100)
  lastName: string;

  @ApiProperty({
    description: 'Senha do usuário. Recomenda-se o uso de uma senha forte.',
    example: 'StrongPassword123!',
  })
  @IsNotEmpty({
    message: 'The password should not be empty',
  })
  // @IsStrongPassword()
  password: string;

  @IsOptional()
  usernameGit?: string;
}
