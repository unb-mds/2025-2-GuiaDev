# Tutorial: Criando um Projeto NestJS com PNPM

Este guia mostra como iniciar um projeto **NestJS** utilizando o **PNPM** como gerenciador de pacotes.  
O **NestJS** é um framework progressivo para construção de aplicações Node.js escaláveis e bem estruturadas, enquanto o **PNPM** é uma alternativa rápida e eficiente ao npm e yarn.

---

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão LTS recomendada) → [Baixar aqui](https://nodejs.org/)  
- **PNPM** → pode ser instalado via npm:
  ```bash
  npm install -g pnpm
  ```

Verifique se tudo está funcionando:
```bash
node -v
pnpm -v
```

---

## Criando o projeto NestJS

1. Instale o **CLI do NestJS** usando o PNPM:
   ```bash
   pnpm dlx @nestjs/cli new meu-projeto
   ```

   > O `pnpm dlx` executa um pacote diretamente, semelhante ao `npx`.

2. Durante a criação, o CLI perguntará qual gerenciador de pacotes você deseja usar.  
   Escolha **pnpm**.

---

## Estrutura do projeto

Após a criação, você terá uma estrutura semelhante a:

```
meu-projeto/
│── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── app.service.ts
│── test/
│── package.json
│── pnpm-lock.yaml
│── tsconfig.json
```

---

## Rodando o projeto

Entre na pasta do projeto e rode o servidor:

```bash
cd meu-projeto
pnpm start:dev
```

Abra o navegador e acesse:

```
http://localhost:3000
```

Você deverá ver a mensagem **"Hello World!"**.

---

## Comandos úteis

- **Gerar novo módulo**:
  ```bash
  pnpm nest g module usuarios
  ```

- **Gerar novo controlador**:
  ```bash
  pnpm nest g controller usuarios
  ```

- **Gerar novo serviço**:
  ```bash
  pnpm nest g service usuarios
  ```

---

## Conclusão

Agora você tem um projeto **NestJS** configurado com o **PNPM**, pronto para desenvolvimento!  
O PNPM garante instalações mais rápidas e economia de espaço em disco, tornando o fluxo de trabalho mais eficiente.

> ✅ Próximos passos: criar módulos, serviços e controladores para expandir sua aplicação.
