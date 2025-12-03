<div align="center">

# 🚀 GuiaDev

### Plataforma Inteligente de Análise e Aprimoramento de Documentação Técnica

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-9.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[Documentação](https://unb-mds.github.io/2025-2-GuiaDev/) • [Arquitetura](https://www.figma.com/design/Ses2U0uY5fJ4i1vn8cAF8w/MDS---GRUPO-03?node-id=0-1&p=f&t=6haQKuj3TeX644EO-0) • [Protótipo](https://www.figma.com/design/NSQw0YsJVA1PZDF9cclfxQ/Alta-Fidelidad) • [Visão do Produto](https://docs.google.com/document/d/13E_innekoi4V3e2igaeZ5Xg_1glMoNRd8j2--BJWiFk)

---

</div>

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Tecnologias](#️-tecnologias)
- [Arquitetura](#-arquitetura)
- [Começando](#-começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Uso com Docker](#-uso-com-docker)
- [Roadmap](#-roadmap)
- [Equipe](#-equipe)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **GuiaDev** é uma plataforma avançada desenvolvida no contexto da disciplina **Métodos de Desenvolvimento de Software (MDS)** da **Universidade de Brasília (UnB)** em 2025/2. 

Nosso objetivo é revolucionar a forma como equipes de desenvolvimento criam, mantêm e aprimoram sua documentação técnica através de:

- 🤖 **Inteligência Artificial**: Bots especializados que analisam e sugerem melhorias
- 📊 **Análise Automatizada**: Avaliação contínua da qualidade documental
- 🔄 **Integração GitHub**: Fluxo nativo com seus repositórios
- ✨ **Padronização**: Aplicação de melhores práticas de Engenharia de Software

### 💡 Por que GuiaDev?

> "A documentação é o espelho da qualidade do código"

Muitos projetos falham não por falta de código, mas por falta de documentação clara e atualizada. O GuiaDev soluciona isso automatizando o processo de análise e melhoria contínua da documentação técnica.

---

## ⚡ Principais Funcionalidades

<table>
<tr>
<td width="50%">

### 🔍 Análise Inteligente
- Avaliação automatizada de qualidade
- Detecção de inconsistências
- Sugestões contextualizadas
- Métricas de completude

</td>
<td width="50%">

### 📝 Padronização
- Templates profissionais
- Guias de estilo integrados
- Convenções de nomenclatura
- Estruturação automática

</td>
</tr>
<tr>
<td width="50%">

### 🔗 Integração GitHub
- Análise de repositórios
- Pull Requests automatizados
- Badges de qualidade
- Webhooks personalizados

</td>
<td width="50%">

### 📊 Dashboard Interativo
- Visualização de métricas
- Histórico de melhorias
- Comparação temporal
- Exportação de relatórios

</td>
</tr>
</table>

---

## 🛠️ Tecnologias

### Frontend
```typescript
React 18.x + TypeScript + Vite
- ⚛️  React com Hooks modernos
- 📘 TypeScript para type-safety
- ⚡ Vite para build ultrarrápido
- 🎨 CSS para estilização
- 📱 Design responsivo e acessível
```

### Backend
```typescript
NestJS 9.x + Prisma + PostgreSQL
- 🏗️  Arquitetura modular e escalável
- 🔐 Autenticação JWT robusta
- 🗃️  Prisma ORM para banco de dados
- 🐘 PostgreSQL via Supabase
- 🧪 Testes automatizados (Jest)
```

### DevOps & Infraestrutura
```bash
Docker + CI/CD + Cloud
- 🐳 Docker & Docker Compose
- 🚀 CI/CD com GitHub Actions
- ☁️  Deploy: Render
- 📈 Monitoring e logs estruturados
```

---

## 🏗️ Arquitetura

Nossa arquitetura segue o **modelo C4** para máxima clareza e escalabilidade:

```mermaid
graph TB
    A[Cliente Web] --> C[Frontend - React]
    C -->|API REST| D[Backend - NestJS]
    D --> E[PostgreSQL]
    D --> F[Gemini]
    D --> G[GitHub API]
    
    style A fill:#4169E1
    style C fill:#4169E1
    style D fill:#E0234E
    style E fill:#4169E1
```

📐 **[Ver documentação completa da arquitetura](https://github.com/unb-mds/2025-2-GuiaDev/blob/main/Docs/Diagrama%20modelo%20C4.pdf)**

---

## 🚀 Começando

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** 18.x ou superior
- **Docker** e **Docker Compose**
- **Git**
- **npm** ou **yarn**

### Instalação

#### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/unb-mds/2025-2-GuiaDev.git
cd 2025-2-GuiaDev
```

#### 2️⃣ Configure as Variáveis de Ambiente

```bash
# Backend
cp backend-nest/.env.example backend-nest/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edite os arquivos `.env` com suas credenciais:

```env
# backend-nest/.env
DATABASE_URL="postgresql://user:password@localhost:5432/guiadev"
JWT_SECRET="seu-secret-super-seguro"
GITHUB_TOKEN="seu-github-token"
```

#### 3️⃣ Instale as Dependências

```bash
# Backend
cd backend-nest
npm install

# Frontend
cd ../frontend
npm install
```

---

## 🐳 Uso com Docker

### Inicialização Rápida

```bash
# Na raiz do projeto

# Build dos containers
docker-compose up --build

# Ou em modo detached (background)
docker-compose up -d
```

### Comandos Úteis

```bash
# Ver status dos containers
docker ps

# Parar os containers
docker-compose down

# Ver logs em tempo real
docker-compose logs -f

# Reconstruir após mudanças
docker-compose up --build
```

### Acesso aos Serviços

Após a inicialização:

- 🌐 **Frontend**: [http://localhost:3001](http://localhost:3001)
- 🔧 **Backend**: [http://localhost:3000](http://localhost:3000)
- 📚 **API Docs**: [http://localhost:3000/api](http://localhost:3000/api)
- 💾 **PostgreSQL**: `localhost:5432`

---

## 🗓️ Roadmap

- [x] Setup inicial do projeto
- [x] Arquitetura e modelagem
- [x] Autenticação e autorização
- [x] Integração com GitHub API
- [ ] Sistema de análise com IA
- [ ] Dashboard de métricas
- [ ] Sistema de notificações
- [ ] Exportação de relatórios
- [ ] Testes E2E completos
- [ ] Deploy em produção

---

## 👥 Equipe

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/filipeBG-07">
        <img src="https://avatars.githubusercontent.com/u/174053010?s=150" width="100px;" alt="Filipe"/><br>
        <sub><b>Filipe Brito</b></sub>
      </a><br>
      <sub>Arquitetura/DevOps</sub>
    </td>
    <td align="center">
      <a href="https://github.com/HugoFreitass">
        <img src="https://avatars.githubusercontent.com/u/130880914?s=150" width="100px;" alt="Hugo"/><br>
        <sub><b>Hugo Freitas</b></sub>
      </a><br>
      <sub>Product manager (PO)</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Phill-Chill">
        <img src="https://avatars.githubusercontent.com/u/164696319?s=150" width="100px;" alt="Phill"/><br>
        <sub><b>Philipe Amancio</b></sub>
      </a><br>
      <sub>Scrum Master (lider)</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/JoaoGSantana10">
        <img src="https://avatars.githubusercontent.com/u/185989079?s=150" width="100px;" alt="João"/><br>
        <sub><b>João Santana</b></sub>
      </a><br>
      <sub>Desenvolvedor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/PedroGTG">
        <img src="https://avatars.githubusercontent.com/u/192148248?s=150" width="100px;" alt="Pedro"/><br>
        <sub><b>Pedro Henrique</b></sub>
      </a><br>
      <sub>Arquitetura/DevOps</sub>
    </td>
    <td align="center">
      <a href="https://github.com/BGrangeiro">
        <img src="https://avatars.githubusercontent.com/u/197856263?s=150" width="100px;" alt="Bruno"/><br>
        <sub><b>Bruno Grangeiro</b></sub>
      </a><br>
      <sub>Designer</sub>
    </td>
  </tr>
</table>

<div align="center">

**Squad 03 | MDS 2025/2**  
**Faculdade de Ciência e Tecnologia em Engenharias (FCTE)**  
**Universidade de Brasília (UnB)**

</div>

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais na disciplina de Métodos de Desenvolvimento de Software da UnB.

---

## 🟢 Deploy

[https://two025-2-guiadev-1-frontend.onrender.com/](https://two025-2-guiadev-1-frontend.onrender.com/)

[https://two025-2-guiadev.onrender.com/](https://two025-2-guiadev-1-frontend.onrender.com/)

---

<div align="center">

### 🌟 Se este projeto foi útil, considere dar uma estrela!

[![GitHub stars](https://img.shields.io/github/stars/unb-mds/2025-2-GuiaDev?style=social)](https://github.com/unb-mds/2025-2-GuiaDev/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/unb-mds/2025-2-GuiaDev?style=social)](https://github.com/unb-mds/2025-2-GuiaDev/network/members)

**Feito com ❤️ pela equipe GuiaDev**

[⬆ Voltar ao topo](#-guiadev)

</div>
