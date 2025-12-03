import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {

    constructor(private readonly chatService: ChatService) {}

    @Post()
    @ApiOperation({
        summary: 'Enviar mensagem para a IA',
        description: 'Recebe uma mensagem do cliente e retorna a resposta gerada pela IA.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Olá, tudo bem?',
                    description: 'Mensagem a ser enviada para a IA.',
                },
            },
            required: ['message'],
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Resposta gerada pela IA.',
        schema: {
            example: {
                reply: 'Olá! Estou bem, como posso ajudar?',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Requisição inválida (message ausente ou inválida).',
    })
    async sendMessage(@Body('message') message: string){
        return this.chatService.getAIResponse(message);
    }
    
}
