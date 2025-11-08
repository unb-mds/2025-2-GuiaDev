import { IsJWT } from "class-validator";

export class logoutDto{
    @IsJWT({
        message: "Token inválido!"
    })
    token: string;
}