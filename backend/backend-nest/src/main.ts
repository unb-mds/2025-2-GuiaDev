import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:5173', 'https://two025-2-guiadev-1-frontend.onrender.com'], // Aceitar ambas as portas
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('GuiaDev API') // esse é o título DENTRO do swagger
    .setDescription('Documentação da API GuiaDev')
    .setVersion('1.0')
    .addBearerAuth()  // habilita JWT no Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/', app, document, {
    customSiteTitle: 'API GuiaDev', // título da aba do navegador
    customCss: `
    /* Remove a topbar */
    .topbar { 
      display: none !important; 
    }

    /* H1 customizado */
    #custom-title {
      font-size: 32px;
      font-weight: 700;
      margin: 20px 0;
      color: #333;
      font-family: sans-serif;
    }
  `,
    customJs: `
    // Adiciona H1 no topo da documentação
    window.onload = function() {
      const container = document.querySelector('.swagger-ui');
      if (container) {
        const h1 = document.createElement('h1');
        h1.id = 'custom-title';
        h1.innerText = 'API GuiaDev';
        container.prepend(h1);
      }
    };
  `
  });

  await app.listen(3000);
}
bootstrap();
