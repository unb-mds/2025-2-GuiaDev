import { IsJWT } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class checkTokenDto {
    @ApiProperty({
        description: "Token JWT enviado pelo cliente para validação.",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    })
    @IsJWT({
        message: "Token inválido!"
    })
    token: string;
}