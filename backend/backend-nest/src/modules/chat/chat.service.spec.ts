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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});