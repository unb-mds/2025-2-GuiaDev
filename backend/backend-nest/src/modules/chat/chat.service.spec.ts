import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('ChatService', () => {
  let service: ChatService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('deve retornar a resposta da IA corretamente', async () => {
    const mockResponse = {
      data: {
        candidates: [
          { content: { parts: [{ text: 'Olá! Sou o assistente técnico do portal.' }] } },
        ],
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    const result = await service.getAIResponse('teste');
    expect(result).toContain('assistente técnico');
  });
});
