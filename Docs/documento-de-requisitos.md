# Documento de requisitos de software para o projeto "portal para escrita técnica em software"

## Versão 1.0 (14/09/2025) Autor: Filipe Brito
Elaboração para análise da primeira versão do documento


## Introdução
Este documento especifica os requisitos que o sistema "portal para escrita técnica em software" deve atender, fornecendo aos desenvolvedores as informações necessárias para o projeto de implementação, realização dos testes e homologação do sistema. O "Portal para escrita técnica em software" é um sistema desenvolvido para realizar uma varredura em um repositório do Github e fazer recomendações e manutenção da documentação para o mesmo.

## Visão geral do documento
O documento de requisitos descreve os requisitos funcionais e não funcionais que o sstema deve atender: ele apresenta os seguintes tópicos abaixo:

* Descrição geral do sistema: Apresenta uma visão geral do sistema, caracterizando qual é o seu escopo e descrevendo seus usuários.
* Requisitos funcionais: especifica todos os requisitos funcionais do sistema, descrevendo os fluxos de eventos, prioridades, atores, entradas e saídas de cada uso a ser implementado.
* Requisitos não-funcionais: especifica todos os requisitos não-funcionais do sistema, divididos em requisitos de usabilidade, Confiabilidade, Desempenho, Segurança, Portabilidade, Manutenibilidade e adequações a padrões e requisitos de hardware e software.

## Prioridade dos requisitos
Para estabelecer a prioridade dos requisitos, foram adotadas as denominações "Essencial","importante" e "desejável".

* "Essencial" é o requisito sem o qual o sistema não entra em funcionamento. Requisitos essenciais são requisitos imprescindíveis, que devem ser implementados obrigatoriamente.
* "Importante" é o requisito sem o qual o sistema entra em funcionamento, mas de forma não satisfatória. Requisitos importantes devem ser implementadis, porém, se não forem, o sistema poderá ser implantado e utilizado mesmo assim.
* "Desejável" é o requisito que não compromete as funcionalidades básicas do sistema, isto é, o sistema pode funcionar de forma satisfatória sem ele. Requisitos desejáveis são requisitos que podem ser deixados para versões posteriores do sistema, casa não haja tempo hábil para implementá-los na versão que está sendo especificada.

## análise de portais existentes
A análise de portais técnicos amplamente utilizados (como **GitLab Handbook**, **Microsoft Docs** e **Google Engineering Practices**) revela pontos em comum que são indispensáveis para a efetividade de um portal de escrita técnica em software:

- **Centralização da informação**: todos os documentos e decisões ficam em um repositório único, de fácil acesso.
- **Versionamento transparente**: cada alteração é registrada e auditável, geralmente acoplada a Git.
- **Estrutura modular e navegável**: conteúdos organizados em seções temáticas e acessíveis por índices e busca.
- **Registro de decisões arquiteturais**: uso de ADRs (Architecture Decision Records) para documentar o raciocínio por trás das escolhas técnicas.
- **Integração ao fluxo de trabalho**: referências cruzadas a código, issues, PRs, retrospectivas e protótipos (como Figma).
- **Sustentação colaborativa**: revisões obrigatórias, templates padronizados e contribuição contínua da equipe.

Esses pontos foram considerados na definição dos requisitos a seguir, adaptados à stack React + NestJS + Prisma.

## Descrição geral do sistema
O "Portal para escrita técnica  em software" será desenvolvido com o objetivo de melhorar o processo de criação de um produto de software através de um guia pronto de documentação para software e recomendações de possíveis documentações que podem ser implementadas no repositório, auxiliando o público-alvo a atingir um desenvolvimento mais produtivo e preciso. As recomendações são feitas por meio de uma varredura no repositório alvo com agentes de IA, após essa varredura, comparar com uma checklist para análise das documentações presentes e faltantes. O sistema será desenvolvido em linguagem HTML,CSS, javascript e framework REACT para frontend. Para backend será desenvolvido com Typescript e framework NestJS, utilizará banco de dados postgreSQL e prisma como ORM e será hospedado em Github pages.

## Descrição do público-alvo

### Público-Alvo Principal

1.  **Equipes de Desenvolvimento de Software**
    -   Startups e empresas de tecnologia que precisam manter
        documentação mínima, mas frequentemente deixam de lado.\
    -   Times ágeis que utilizam Scrum/Kanban e necessitam de
        documentação leve, porém efetiva.
2.  **Gerentes de Projeto e de Produto (PMs/POs)**
    -   Necessitam garantir rastreabilidade, clareza de requisitos e
        comunicação entre áreas.\
    -   Interessam-se por relatórios rápidos acerca da qualidade da
        documentação.
3.  **Engenheiros de Qualidade e Profissionais de DevOps**
    -   Focados em conformidade, boas práticas e integração contínua.\
    -   Beneficiam-se de alertas automáticos sobre lacunas em
        documentação técnica.
4.  **Acadêmicos e Estudantes de Engenharia de Software**
    -   Professores e alunos que podem utilizar a plataforma como
        ferramenta educacional para reforçar boas práticas de
        documentação.

------------------------------------------------------------------------

### Público-Alvo Secundário

-   **Consultorias de TI** → utilizam a ferramenta para avaliar a
    maturidade de processos de clientes.\
-   **Empresas em busca de certificações (ISO, CMMI, etc.)** →
    necessitam de evidências de documentação organizada.\
-   **Comunidades Open Source** → projetos colaborativos que
    frequentemente carecem de padronização e clareza documental.

------------------------------------------------------------------------

### Síntese

A plataforma mostra-se especialmente útil para equipes que buscam elevar
a qualidade da documentação sem comprometer a agilidade. Além disso,
representa uma oportunidade valiosa para instituições acadêmicas e
organizações que demandam **educação, auditoria e padronização de
processos**.

## Requisitos funcionais (Revisados para a Stack React/NestJS/Prisma)


### Módulo 1: Backend (API com NestJS + Prisma)

Estes são os requisitos para a sua aplicação servidora.

RF-B01 (API de Análise): O sistema deve expor um endpoint de API (ex: POST /api/analysis) que recebe a URL de um repositório GitHub e dispara o processo de análise.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-B02 (Persistência de Dados): O sistema deve usar o Prisma para salvar os resultados da análise (repositório, arquivos encontrados, pontuações, recomendações) no banco de dados.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-B03 (API de Consulta): O sistema deve expor endpoints para consultar os dados salvos (ex: GET /api/reports para listar todas as análises, GET /api/reports/:id para ver um resultado específico).
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-B04 (Lógica de Negócio - Scanner): O sistema deve conter a lógica para clonar um repositório, varrer seus arquivos e identificar a documentação relevante.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-B05 (Lógica de Negócio - IA): O sistema deve se comunicar com a API de um serviço de IA externo, enviando o conteúdo dos documentos e processando a resposta (pontuação e recomendações).
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-B06 (Processamento em Segundo Plano): O sistema deve ser capaz de executar a análise (que pode ser demorada) em segundo plano (asynchronous job/task) para não bloquear a API. O endpoint inicial pode retornar um 202 Accepted e o frontend pode consultar o status depois.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-B07 (Gerenciamento de Conteúdo): O sistema deve expor endpoints CRUD (Create, Read, Update, Delete) para gerenciar o conteúdo educacional (os guias e tutoriais).
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

### Módulo 2: Frontend (Portal com React)

Estes são os requisitos para a sua aplicação cliente (o que roda no navegador).

RF-F01 (Comunicação com API): O portal deve se comunicar exclusivamente com a API do backend (NestJS) para buscar e enviar todos os dados dinâmicos.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-F02 (Submissão de Análise): O portal deve fornecer um formulário onde o usuário pode inserir a URL de um repositório GitHub e enviá-la para o endpoint POST /api/analysis.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-F03 (Visualização de Resultados): O portal deve chamar a API (GET /api/reports) e renderizar a lista de análises concluídas e seus dashboards de resultados.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-F04 (Exibição em Tempo Real): O portal deve ser capaz de atualizar o status de uma análise em andamento, consultando a API periodicamente ou usando tecnologias em tempo real como WebSockets (um requisito mais avançado).
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-F05 (Visualização do Guia): O portal deve buscar os dados do conteúdo educacional da API e renderizar os guias, passos e animações.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RF-F06 (Autenticação de Usuário): O portal deve permitir que usuários se cadastrem e façam login. As requisições para a API deverão ser autenticadas (ex: via JWT). Essa arquitetura torna a autenticação um passo natural.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

### Módulo 3: Worker / Tarefas Agendadas (Ainda pode usar GitHub Actions)

O papel da GitHub Action muda. Em vez de ser o "backend", ela se torna um simples "cliente" ou "trigger" para o seu backend real.

RF-W01 (Disparo de Tarefas): O sistema deve ter um mecanismo para acionar análises recorrentes de repositórios pré-configurados. Isso pode ser uma GitHub Action rodando com cron que simplesmente faz uma chamada para o endpoint POST /api/analysis do seu backend.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

## Requisitos não-funcionais

**Usabilidade**

Esta seção descreve os requisitos não-funcionais associados à facilidade de uso da interface com o usuário, material de treinamento e documentação do sistema.

RNF001 (Interface amigável): O portal deve ter uma interface intuitiva e fácil de entendimento, interface simples, com destaque para os guia e recomendações.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável


RNF002 (facilidade de acesso)O sistema deve ser fácil de utilização: pelo menos 80% dos usuários devem conseguir utilizá-lo sem necessidade de treinamento.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

**Acessibilidade**

RNF003 (inclusão): O portal deve seguir padrões WCAG, incluindo contraste adequado, navegação por teclado e suporte a leitores de telas para pessoas PCD.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

**3. Confiabilidade**

RNF004 (acertividade): O sistema deve exibir recomendações quando algum usuário pesquisar algo dentro do portal, recomendações corretas em pelo menos 95% das varreduras realizadas em repositórios.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RNF005 (consistência): Deve ser capaz de processar repositórios simulados e retornar resultados consistentes.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

**4. Desempenho**

RNF006 (Performance): O tempo de carregamento da página deve demorar no máximo 3 segundos.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RNF007 (performance de varredura): A execução dos bots no GitHub deve demorar no máximo 2 minutos para processar os repositórios.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

**5. Segurança**

RNF008 (): Toda comunicação entre o usuário e o servidor deve ser feito via protocolo seguro HTTPS.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

**6. Portabilidade**

RNF009 (acesso web): O portal deve rodar em diferentes navegadores, exemplos: Google Chrome, Firefox, Edge, Opera… etc.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RNF010 (adaptação): A interface deve se adaptar a cada desktop conforme o tamanho da tela, exemplos: tablets e celulares.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

**7. Manutenibilidade**

RNF011 (controle de versões): O código do sistema deve estar versionado no GitHub com documentação clara e atualizada.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RNF012 (modularização): A estrutura dos arquivos JSON deve ser modular, facilitando a manutenção e evolução futura dos sistema.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

**8. Escalabilidade**

RNF013 (updates): O sistema deve ser projetado para suportar expansão futura, como inclusão de novos tipos de análises de documentos.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável

RNF014 (atualização de checklist): Deve ser possível adicionar novos checklist sem necessidade de reescrever o sistema inteiros.
#### PRIORIDADE:
- [] 🔴 Essencial
- [] 🟡 Importante
- [] 🟢 Desejável
