import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChatService {

  private tokenAI = process.env.GEMINI_API_KEY;
  private model = 'gemini-2.5-flash';

  constructor(private readonly httpService: HttpService) {}

  async getAIResponse(message: string): Promise<string> {
    if (!this.tokenAI) {  //se o token n for o certo n vai rodar
      console.error('Chave da AI não configurada');
      throw new InternalServerErrorException('Token da API não configurado.');
    }

    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.tokenAI}`;
      
      const systemPrompt = "Você é um assistente técnico especializado em análise de repositórios GitHub.";
      
      const contents = [
          {
            role: 'user', 
            parts: [{ text: `Instrução: ${systemPrompt}` }], 
          },
          {
            role: 'user', 
            parts: [{ text: message }],
          },
      ];

      const response = await lastValueFrom(this.httpService.post(
        API_URL,
        {
          contents: contents, 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ));

      const candidate = response?.data?.candidates?.[0];
      const content = candidate?.content?.parts?.[0]?.text ?? null;

      if (!content) {
        console.error('Resposta inválida da API de IA:', response?.data);
        throw new InternalServerErrorException('Resposta inválida da API de IA.');
      }

      return content.trim();
    } catch (err: any) {
      console.error('Erro ao chamar AI:', err?.response?.status, err?.response?.data ?? err?.message);
      throw new InternalServerErrorException('Erro ao chamar serviço AI.');
    }
  }
}