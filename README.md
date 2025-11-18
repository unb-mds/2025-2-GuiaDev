# **GuiaDev**

Plataforma avançada para **análise, organização e aprimoramento de documentação técnica** em projetos de software. Desenvolvida no contexto da disciplina **Métodos de Desenvolvimento de Software — UnB (2025/2)**, a solução integra automações inteligentes e padrões consolidados de Engenharia de Software para elevar a qualidade documental de repositórios GitHub.

O GuiaDev utiliza **bots de IA** para inspecionar, avaliar e sugerir melhorias estruturadas na documentação dos projetos, tornando o processo mais ágil, consistente e eficiente para equipes de desenvolvimento de qualquer porte.

---

## **Sumário**
- [Documentação](#documentação)
- [Links Úteis](#links-úteis)
- [Equipe](#equipe)
- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Inicialização e Configuração](#inicialização-e-configuração)

---

## **Documentação**

Acesse a documentação oficial do projeto:

🔗 **https://unb-mds.github.io/2025-2-GuiaDev/**

---

## **Links Úteis**

- **Story Map & Activity Flow:**  
  https://www.figma.com/design/Ses2U0uY5fJ4i1vn8cAF8w/MDS---GRUPO-03  
- **Documento de Visão do Produto:**  
  https://docs.google.com/document/d/13E_innekoi4V3e2igaeZ5Xg_1glMoNRd8j2--BJWiFk  
- **Arquitetura (Modelo C4):**  
  https://github.com/unb-mds/2025-2-GuiaDev/blob/main/Docs/Diagrama%20modelo%20C4.pdf  
- **Protótipo de Alta Fidelidade:**  
  https://www.figma.com/design/NSQw0YsJVA1PZDF9cclfxQ/Alta-Fidelidade  

---

## **Equipe**  
**Squad 03 — MDS 2025/2 – FCTE/UnB**

| Filipe | Hugo | Phill | João | Pedro | Bruno |
|--------|-------|--------|--------|--------|--------|
| [![Filipe](https://avatars.githubusercontent.com/u/174053010?s=200)](https://github.com/filipeBG-07) | [![Hugo](https://avatars.githubusercontent.com/u/130880914?s=200)](https://github.com/HugoFreitass) | [![Phill](https://avatars.githubusercontent.com/u/164696319?s=200)](https://github.com/Phill-Chill) | [![João](https://avatars.githubusercontent.com/u/185989079?s=200)](https://github.com/JoaoGSantana10) | [![Pedro](https://avatars.githubusercontent.com/u/192148248?s=200)](https://github.com/PedroGTG) | [![Bruno](https://avatars.githubusercontent.com/u/197856263?s=200)](https://github.com/BGrangeiro) |
| [Filipe](https://github.com/filipeBG-07) | [Hugo](https://github.com/HugoFreitass) | [Phill](https://github.com/Phill-Chill) | [João](https://github.com/JoaoGS) | [Pedro](https://github.com/PedroGTG) | [Bruno](https://github.com/BGrangeiro) |

---

## **Visão Geral**

O GuiaDev foi idealizado para ser uma ferramenta de apoio na criação e manutenção de documentação técnica confiável, padronizada e continuamente atualizada.  
Ele atende desde pequenas equipes até projetos complexos, promovendo:

- Padronização dos artefatos técnicos  
- Redução do tempo gasto em escrita e revisão  
- Diagnósticos inteligentes da qualidade documental  
- Manutenção contínua da consistência entre código e documentação  
- Fluxo integrado com GitHub e ferramentas modernas de desenvolvimento  

A plataforma foi construída com foco em **robustez**, **usabilidade** e **experiência do desenvolvedor**.

---

## **Tecnologias Utilizadas**

### **Principais Tecnologias**
- **Frontend:** React + TypeScript + Vite  
- **Backend:** NestJS (TypeScript)  
- **ORM:** Prisma  
- **Banco de Dados:** PostgreSQL (via Supabase)  
- **CI/CD & Deploy:**  
  - Frontend: Vercel  
  - Backend: Railway / Render  
  - Infra: Docker & Docker Compose  

### **Badges**
![Node.js](https://img.shields.io/badge/Node.js-18.x-43853D?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![NestJS](https://img.shields.io/badge/NestJS-9.x-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?logo=postgresql&logoColor=white)

---

## **Inicialização e Configuração**

### **1. Configuração Inicial**

Crie o arquivo de variáveis de ambiente do backend:

```bash
cp backend-nest/.env.example backend-nest/.env
