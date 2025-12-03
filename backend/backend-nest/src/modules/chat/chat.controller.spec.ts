import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatModule } from './chat.module';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';


process.env.GEMINI_API_KEY = 'MOCK_TEST_KEY';

describe('ChatController', () => {
  let app: INestApplication;
  let controller: ChatController;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ChatModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        post: jest.fn(() =>
          of({
            data: {
              candidates: [
                {
                  content: { parts: [{ text: 'Resposta simulada do Gemini' }] },
                },
              ],
            },
          }),
        ),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    controller = app.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/chat (POST) deve retornar a resposta da IA', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ message: 'teste' })
      .expect(201);

    expect(response.text).toContain('Resposta simulada');
  });

  afterAll(async () => {
    await app.close();
  });
});