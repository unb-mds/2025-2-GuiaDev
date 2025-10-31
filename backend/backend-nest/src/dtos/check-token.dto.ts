import { IsJWT } from "class-validator";

export class checkTokenDto{
    @IsJWT({
        message: "Token inválido!"
    })
    token: string;
}