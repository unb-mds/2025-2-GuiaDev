# **GuiaDev**

Plataforma completa para **escrita técnica em projetos de software**, desenvolvida no contexto da disciplina **MDS – UnB (2025.2)**.

O objetivo é facilitar a criação, organização e manutenção de documentação técnica, alinhada a boas práticas de documentação para Engenharia de Software.

O GuiaDev analisa a documentação presente nos repositórios do github utilizando bots de IA, que resulta em análises eficientes e acertivas para a documentação técnica presente em projetos de pequeno,médio ou grande porte.

---

## Sumário

  - [Documentação](#documenta%C3%A7%C3%A3o)
  - [Links úteis](#links-%C3%BAteis)
  - [Equipe](#equipe)
  - [Visão Geral](#vis%C3%A3o-geral)
  - [Tecnologias](#tecnologias-utilizadas)
  - [Inicialização](#inicializa%C3%A7%C3%A3o-e-configura%C3%A7%C3%A3o)


## Documentação

**Acesse a documentação completa do projeto aqui:** [clique aqui](https://unb-mds.github.io/2025-2-GuiaDev/)


## Links úteis

**Story map e Activity flow:** [clique aqui](https://www.figma.com/design/Ses2U0uY5fJ4i1vn8cAF8w/MDS---GRUPO-03?node-id=0-1&p=f&t=JVrFpCNAFC0Fmbp2-0)

**Visão do Produto:** [documento de visão do produto](https://docs.google.com/document/d/13E_innekoi4V3e2igaeZ5Xg_1glMoNRd8j2--BJWiFk/edit?usp=sharing)

**Arquitetura:** [clique aqui](https://github.com/unb-mds/2025-2-GuiaDev/blob/main/Docs/Diagrama%20modelo%20C4.pdf)

**Protótipo:** [clique aqui](https://www.figma.com/design/NSQw0YsJVA1PZDF9cclfxQ/Alta-Fidelidade?node-id=0-1&p=f&t=0bIOylbBO4zvvhBF-0)


## Equipe 
Squad 03-MDS 2025/2-FCTE/UnB

| [![Filipe](https://avatars.githubusercontent.com/u/174053010?s=400&u=783a5f3ac74a2694131b66a4dd2c5082f092b570&v=4)](https://github.com/filipeBG-07) | [![Hugo](https://avatars.githubusercontent.com/u/130880914?v=4)](https://github.com/HugoFreitass) | [![Phill](https://avatars.githubusercontent.com/u/164696319?v=4)](https://github.com/Phill-Chill) | [![João](https://avatars.githubusercontent.com/u/185989079?v=4)](https://github.com/JoaoGSantana10) | [![Pedro](https://avatars.githubusercontent.com/u/192148248?v=4)](https://github.com/PedroGTG) | [![Bruno](https://avatars.githubusercontent.com/u/197856263?v=4)](https://github.com/BGrangeiro) |
|---|---|---|---|---|---|
| [Filipe](https://github.com/filipeBG-07) | [Hugo](https://github.com/HugoFreitass) | [Phill](https://github.com/Phill-Chill) | [João](https://github.com/JoaoGS) | [Pedro](https://github.com/PedroGTG) | [Bruno](https://github.com/BGrangeiro) |


## Visão Geral

O portal foi projetado para apoiar **equipes de desenvolvimento** e **escritores técnicos** na elaboração de documentação clara, padronizada e colaborativa.

**Objetivos do Projeto:**
- Reduzir o tempo necessário para criar documentação de qualidade  
- Padronizar a estrutura de documentos técnicos  
- Garantir documentação sempre atualizada  
- Proporcionar uma experiência *developer-friendly*  

---

## Tecnologias utilizadas

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![NestJS](https://img.shields.io/badge/NestJS-9.x-E0234E?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)

- **Frontend:** React + TypeScript + Vite  
- **Backend:** NestJS com TypeScript  
- **Banco de Dados:** PostgreSQL via Supabase  
- **Deploy:** Vercel (frontend) + Railway/Render (backend)  
- **ORM:** Prisma

---


## Inicialização e configuração
>  Executando com Docker

Guia rápido para iniciar o ambiente de desenvolvimento.

### 1. Preparar o Ambiente

Crie o arquivo de configuração do backend a partir do exemplo:
```bash
cp backend-nest/.env.example backend-nest/.env
```
> **Nota:** Se necessário, ajuste as variáveis no arquivo `backend-nest/.env`.

### 2. Iniciar a Aplicação

Use o comando abaixo na raiz do projeto para construir e iniciar os contêineres:
```bash
docker-compose up --build
```
e só para inicia-lo posteriormente:
```bash
docker-compose up
```
Caso queira verificar os contâiner rodando:
```bash
docker ps
```
Após a inicialização:
- **Frontend:** `http://localhost:3001`
- **Backend:** `http://localhost:3000`

### 3. Remover o contâiner

Para remover os contêineres, execute:
```bash
docker-compose down
```


TESTE