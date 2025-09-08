# Estudo de Modelos de Arquitetura de Software

## Descrição
Foi realizada uma pesquisa e análise comparativa entre diferentes modelos de arquitetura de software, com o objetivo de avaliar qual seria o mais adequado ao projeto.  
Os modelos estudados foram: **Monolito**, **Microserviços**, **SOA** e **Serverless**.  

## Modelos Analisados

### 1. Monolito
**Descrição:** Toda a aplicação é construída e implantada como uma única unidade.  

**Vantagens**
- Simplicidade inicial de desenvolvimento e deploy  
- Adequado para sistemas pequenos e com escopo bem definido  
- Menor sobrecarga operacional  

**Desvantagens**
- Escalabilidade limitada, pois não é possível dimensionar módulos de forma independente  
- Crescimento do código torna a manutenção mais complexa  
- Risco elevado em deploys, já que qualquer alteração impacta todo o sistema  

---

### 2. Microserviços
**Descrição:** A aplicação é dividida em serviços independentes, comunicando-se geralmente por meio de APIs.  

**Vantagens**
- Escalabilidade independente de cada serviço  
- Flexibilidade tecnológica, permitindo stacks diferentes em cada serviço  
- Maior resiliência: falhas em um serviço não comprometem todo o sistema  

**Desvantagens**
- Complexidade operacional elevada  
- Necessidade de ferramentas de monitoramento e orquestração  
- Comunicação entre serviços pode gerar latência  

---

### 3. SOA (Service-Oriented Architecture)
**Descrição:** Arquitetura orientada a serviços, normalmente com um barramento central (ESB).  

**Vantagens**
- Reuso de serviços em diferentes aplicações  
- Integração facilitada entre sistemas corporativos  

**Desvantagens**
- Elevada complexidade  
- Dependência de um barramento central, que pode se tornar gargalo  
- Menos indicada para sistemas modernos em nuvem  

---

### 4. Serverless
**Descrição:** Funções independentes executadas sob demanda em um provedor de nuvem.  

**Vantagens**
- Escalabilidade automática  
- Custo proporcional ao uso real  
- Dispensa o gerenciamento de servidores  

**Desvantagens**
- Forte dependência do provedor de nuvem (vendor lock-in)  
- Dificuldade de monitoramento e depuração  
- Possibilidade de latência em cold starts  

---

## Comparação Resumida

| Arquitetura   | Escalabilidade | Complexidade | Custo Inicial | Manutenção |
|---------------|----------------|--------------|---------------|------------|
| Monolito      | Baixa          | Baixa        | Baixo         | Alta       |
| Microserviços | Alta           | Alta         | Médio/Alto    | Média      |
| SOA           | Média          | Alta         | Alto          | Alta       |
| Serverless    | Alta           | Média        | Baixo         | Média      |

---

## Decisão Arquitetural
Após a análise, foi decidido adotar a seguinte arquitetura para o projeto:

- **Backend**
  - NestJS como framework principal  
  - PostgreSQL como banco de dados relacional  
  - Supabase para gerenciamento da infraestrutura do banco e autenticação  
  - Prisma como ORM para acesso e modelagem do banco  

- **Frontend**
  - React para construção da interface do usuário  

- **Infraestrutura**
  - Docker Compose para orquestração dos serviços e padronização do ambiente de desenvolvimento  

### Justificativa
- O projeto exige modularidade e organização, mas não demanda, neste momento, a complexidade total de uma arquitetura baseada em microserviços  
- A combinação **NestJS + Prisma + PostgreSQL** oferece robustez e escalabilidade futura  
- O **Supabase** facilita a integração de autenticação e banco de dados, mantendo flexibilidade  
- O **React** é uma escolha consolidada para desenvolvimento front-end, garantindo produtividade e suporte da comunidade  
- O uso do **Docker Compose** simplifica o setup local, padronizando o ambiente e facilitando a integração dos serviços  

---

## Definition of Done
- Documentação criada e revisada  
- Exemplos de uso adicionados (tecnologias selecionadas)  
- Conclusão registrada sobre quais arquiteturas são mais adequadas ao projeto  
- Validação realizada pelo time  
