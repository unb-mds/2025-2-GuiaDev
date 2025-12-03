import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { HttpModule } from '@nestjs/axios';

process.env.GEMINI_API_KEY = 'MOCK_TEST_KEY';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('deve retornar a resposta da IA corretamente', async () => {
    const mockResponse = {
      data: {
        candidates: [
          {
            content: {
              parts: [{ text: 'Olá! Sou o assistente técnico do portal.' }],
            },
          },
        ],
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    const result = await service.getAIResponse('teste');
    expect(result).toContain('assistente técnico');
  });
});