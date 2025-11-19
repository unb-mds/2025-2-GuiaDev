import {IsEmail, IsNotEmpty, IsOptional, IsStrongPassword, Length} from 'class-validator'

export class CreateUserBody {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty({
        message: 'The name should not be empty',
    })
    @Length(3, 50)
    name: string;

    @IsNotEmpty({
        message: "The last name should not be empty",
    })
    @Length(3, 100)
    lastName: string;

    @IsNotEmpty({
        message: "The password should not be empty",
    })
    // @IsStrongPassword()
    password: string;

    @IsOptional()
    usernameGit?:string;
}

