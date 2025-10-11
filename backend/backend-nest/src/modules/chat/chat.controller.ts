import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';


@Controller('chat')
export class ChatController {

    constructor(private readonly chatService: ChatService) {}

    @Post()
    async sendMessage(@Body('message') message: string){
        return this.chatService.getAIResponse(message);
    }
    
}
