import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatModule } from './chat.module';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('ChatController (e2e)', () => {
  let app: INestApplication;
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
                { content: { parts: [{ text: 'Resposta simulada do Gemini' }] } },
              ],
            },
          }),
        ),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
