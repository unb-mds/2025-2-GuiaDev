import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { INestApplication } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';


import request = require('supertest');

process.env.GEMINI_API_KEY = 'MOCK_TEST_KEY';

describe('ChatController', () => {
  let app: INestApplication;
  let controller: ChatController;

  const mockChatService = {
    getAIResponse: jest.fn().mockResolvedValue('Resposta da IA'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/chat (POST) deve retornar a resposta da IA', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ message: 'teste' })
      .expect(201);
      
    expect(response.text).toBe('Resposta da IA');
  });

  afterAll(async () => {
    await app.close();
  });
});