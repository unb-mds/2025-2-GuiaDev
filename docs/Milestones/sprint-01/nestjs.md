# Estudo de NestJS

## O que é?

NestJS é um framework web para construção de backend, web API e microsserviços em Node.js. Ele é baseado em TypeScript( mas tabém funciona com javascript puro) e ele utiliza conceitos como módulos, injeção de dependências e decoradores.
É um framework que da todas as ferramentas e arquitetura para montar sua estrutura de backend, ou seja, ele é rígido quanto a arquitetura da aplicação, mas te torna muito mais produtivo por poder focar apenas na lógica da aplicação. També permite criar aplicações escaláveis e fáceis de testar
Resumindo, ele organiza melhor o código de aplicações backend, principalmente API's.

## Para que serve?

Ele é usado para criar:

* API's REST (endpoints HTTP,tipo /users, /products)
* API's GrahQL
* Aplicações com WebSockets (tempo real).
* Microserviços (arquitetura distribuída).
* Aplicações monolíticas bem estruturadas.
Diferente do Express(que também é muito popular com Node.js), o NestJS ja vem com arquitetura pronta e boas práticas embutidas.

## O que preciso para usar?

Antes de usar, você precisa ter instalado no seu computador:
* Node.js(versão LTS recomendada): é a base para rodar qualquer aplicação em NestJS.
* npm (vem junto com o Node.js): gerenciador de pacotes.
* Editor de código(VScode é o mais utilizado).
* Conhecimentos básicos de: Javascript/Typescript e conceitos de backend(rotas,HTTP,banco de dados).

## Como instalar o NestJS?

O NestJS tem uma CLI (Command Line Interface) que ajuda a criar e gerenciar projetos.
No terminal, instale a CLI globalmente:
```
npm install -g @nestjs/cli

```
Depois, crie um projeto novo dentro de uma pasta que você queira, ou diretamente mesmo:
```
nest new meu-projeto

```
Ele vai perguntar qual gerenciador de pacotes você quer (npm, yarn, pnpm). Escolha um.
em seguida escreva:
```
cd meu-projeto
npm run start:dev

```
Isso vai rodar o servidor localmente (geralmente em http://localhost:3000).

## Estrutura de um projeto NestJS

Quando você cria um projeto, ele já vem com uma estrutura inicial:
```
src/
 |-> app.controller.ts      // Controlador (rotas)
 |-> app.module.ts          // Módulo raiz
 |-> app.service.ts         // Serviço (lógica de negócio)
 |-> main.ts                // Ponto de entrada da aplicação
```
### Explicando
* Controller → onde você define as rotas (/users, /products, etc.).
* Service → onde você coloca a lógica de negócio (cálculos, regras, conexões).
* Module → organiza controllers e services em "caixinhas".
* main.ts → arquivo inicial que sobe a aplicação.

## Conceitos principais do NestJS

O NestJS tem alguns conceitos que você vai usar sempre:

### Controllers
Responsáveis por receber requisições e devolver respostas.
exemplo:
```
import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get()
  getHello(): string {
    return 'Olá, NestJS!';
  }
}
```
Se você abrir http://localhost:3000/hello, vai ver:
"Olá, NestJS!"

### Services
São classes que contêm a lógica de negócio.
Exemplo:
```
import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getMessage(): string {
    return 'Mensagem vinda do serviço!';
  }
}
```
### Modules
Agrupam controllers e services.
Exemplo:
```
import { Module } from '@nestjs/common';
import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';

@Module({
  controllers: [HelloController],
  providers: [HelloService],
})
export class HelloModule {}
```
## Exemplo prático: criando rota de usuários

Criar um módulo de usuários no próprio terminal,dentro do projeto,com o comando:
```
nest generate module users

```
Criar um controller de usuários:

```
nest generate controller users

```
Criar um service de usuários:

```
nest generate service users

```
Código do users.service.ts:
```
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = ['Ana', 'Bruno', 'Carlos'];

  findAll() {
    return this.users;
  }
}

```
Código do users.controller.ts:
```
import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }
}

```
Se você acessar http://localhost:3000/users, vai receber:
["Ana","Bruno,"Carlos"]

## O que mais dá pra fazer com NestJS?

* Conectar a bancos de dados (MySQL, PostgreSQL, MongoDB) → geralmente usando o Prisma ou o TypeORM.
* Autenticação e autorização
* Filtragem, interceptores e middlewares → para tratar erros, logs, validações.
* Validação automática de dados: usando "class-validator".
* Microserviços → para sistemas distribuídos.









