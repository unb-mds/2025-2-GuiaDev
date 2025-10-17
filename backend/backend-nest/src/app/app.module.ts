import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../modules/user/user.module';
import { authModule } from 'src/modules/auth/auth.module';
import { GithubModule } from 'src/modules/github/github.module';
import { ChatModule } from 'src/modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    authModule,
    GithubModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
