import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
