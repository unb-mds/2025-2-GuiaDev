# Documento de requisitos de software para o projeto "GuiaDev"

## Versão 1.2 (06/11/2025) Autor: Filipe Brito
terceira versão do documento. Alterações de requisitos funcionais e não-funcionais.


## Introdução
Este documento especifica os requisitos que o sistema "GuiaDev" deve atender, fornecendo aos desenvolvedores as informações necessárias para o projeto de implementação, realização dos testes e homologação do sistema. O "GuiaDev" é um sistema desenvolvido para realizar uma varredura em um repositório do Github e fazer recomendações e manutenção da documentação para o mesmo.

## Visão geral do documento
O documento de requisitos descreve os requisitos funcionais e não funcionais que o sstema deve atender: ele apresenta os seguintes tópicos abaixo:

* Descrição geral do sistema: Apresenta uma visão geral do sistema, caracterizando qual é o seu escopo e descrevendo seus usuários.
* Requisitos funcionais: especifica todos os requisitos funcionais do sistema, descrevendo os fluxos de eventos, prioridades, atores, entradas e saídas de cada uso a ser implementado.
* Requisitos não-funcionais: especifica todos os requisitos não-funcionais do sistema, divididos em requisitos de usabilidade, Confiabilidade, Desempenho, Segurança, Portabilidade, Manutenibilidade e adequações a padrões e requisitos de hardware e software.


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
O "GuiaDev" será desenvolvido com o objetivo de melhorar o processo de criação de um produto de software através de um guia pronto de documentação para software e recomendações de possíveis documentações que podem ser implementadas no repositório, auxiliando o público-alvo a atingir um desenvolvimento mais produtivo e preciso. As recomendações são feitas por meio de uma varredura no repositório alvo com agentes de IA, após essa varredura, comparar com uma checklist para análise das documentações presentes e faltantes. O sistema será desenvolvido em linguagem HTML,CSS, javascript e framework REACT para frontend. Para backend será desenvolvido com Typescript e framework NestJS, utilizará banco de dados postgreSQL e prisma como ORM e será hospedado em Github pages.

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

Requisitos funcionais descrevem as funcionalidades e as ações que um sistema ou produto deve ser capaz de executar. Eles detalham as tarefas específicas que este produto deve realizar para atender às necessidades do usuário.

A seguir, os requisitos funcionais do projeto:

RF-01: O usuário deverá ser capaz de cadastrar conta no sistema.


RF-02: O usuário deverá ser capaz de entrar e sair de sua conta no sistema.


RF-03: O usuário deverá ser capaz de editar seus dados pessoais.


RF-04: O usuário deverá ser capaz de excluir sua conta do sistema.


RF-05: O usuário deverá ser capaz de realizar login social com e github.


RF-06: O sistema deverá ser capaz de analisar um projeto por meio do link do repositório do projeto.


RF-07: O sistema deverá ser capaz de buscar os repositórios de um usuário autenticado com o github.


RF-08: O usuário deverá ser capaz de se autenticar com o github sem fazer login social.


RF-09 (Submissão de Análise): O usuário deverá ser capaz de visualizar todos os seus repositórios acessados pelo sistema.


RF-010: O usuário deve ser capaz de solicitar a análise de um dos repositórios.


RF-11: A aplicação deverá apresentar uma análise automática do projeto em termos de arquitetura, documentação e boas práticas, fornecendo sugestões de arquivos, pastas e boas práticas.
(ex.: README, CONTRIBUTING, LICENSE, CHANGELOG, docs/)


RF-12: O sistema deve exibir de forma visual o nível de completude das práticas recomendadas, para cada projeto analisado.


RF-13: O sistema deve avisar o usuário de forma visual de que a análise do projeto está em andamento.


RF-14: O sistema deve possuir persistência de dados com relação aos projetos acessados.


RF-15: O sistema deve possuir uma barra de pesquisa para buscar os projetos acessados.


RF-16: O sistema deverá possuir uma seção de aprendizado com elementos interativos.


RF-17: A seção de aprendizado deve possuir um campo de texto para tirar dúvidas com o agente de IA.


RF-18: O sistema deverá fornecer o contexto de aprendizado ao agente de IA e retornar a resposta da dúvida.


RF-19: O sistema deve retornar a análise de um projeto no formato de  texto, evidenciando cada ponto do checklist utilizado para tal.


## Requisitos não-funcionais

Requisitos não funcionais descrevem características e qualidades do sistema ou produto. Eles estão relacionados a aspectos como desempenho, confiabilidade, segurança, usabilidade e compatibilidade.

A seguir, os requisitos não-funcionais do projeto:

**Usabilidade**


RNF-01: A aplicação deverá ter design intuitivo e interativo, proporcionando uma experiência visual agradável.


RNF-02: O sistema será uma aplicação web.


**Acessibilidade**

RNF-03 : a aplicação deverá ser acessível em diferentes dispositivos (desktop e mobile).


RNF-04: O sistema deverá realizar as análises usando o agente de IA do Gemini.


**Desempenho**

RNF-05: o sistema deve realizar a análise de forma assíncrona e retornar o resultado.


RNF-06 (performance de varredura): A execução dos bots no GitHub deve demorar no máximo 2 minutos para processar os repositórios.


**Segurança**

RNF-07: o sistema deverá autenticar os usuários via token.


RNF-08: as senhas devem ser armazenadas criptografadas.


**Integrabilidade**

RNF-09: o sistema deve se comunicar exclusivamente com a API do backend. 


**7. Manutenibilidade**

RNF-10: O código do sistema deve estar versionado no GitHub com documentação clara e atualizada.


### Resumo geral dos requisitos

O sistema contará com cadastro de usuários (proprietário e social), análise automatizada da documentação e arquitetura de projetos, e uma página interativa de aprendizado de boas práticas de documentação de projetos de software, entre outras funcionalidades. Seu objetivo é ser uma aplicação que auxilia desenvolvedores no desenvolvimento de projetos organizados, bem documentados e escaláveis.

