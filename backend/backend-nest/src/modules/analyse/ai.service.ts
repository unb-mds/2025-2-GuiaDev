import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly model: any;

  constructor(private readonly configService: ConfigService) {
    // Pega a chave da API do arquivo .env
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');


    if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
  }


    const genAI = new GoogleGenerativeAI(geminiApiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  } // DÚVIDA GEMINI PRO OU FLASH 

  async analyzeDocumentation(repoDocs: any, checklist: any[]): Promise<any> {
    // Monta o prompt com os dados recebidos e o checklist
    const prompt = `
      Você é um especialista em análise de documentação de software. Sua tarefa é avaliar os documentos de um repositório com base em um checklist.

      **Checklist de Documentação:**
      ${JSON.stringify(checklist, null, 2)}

      **Documentos do Repositório:**
      // Aqui fornecemos o conteúdo dos arquivos que você já buscou.
      ${JSON.stringify(repoDocs, null, 2)}

      **Sua Resposta:**
      Responda APENAS com um objeto JSON válido, seguindo estritamente esta estrutura:
      {
        "documentacao_existente": [
          { "id_checklist": "...", "descricao": "...", "justificativa": "..." }
        ],
        "documentacao_faltante": [
          { "id_checklist": "...", "descricao": "...", "sugestao": "..." }
        ]
      }
    `;

    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedJson);
  }
}