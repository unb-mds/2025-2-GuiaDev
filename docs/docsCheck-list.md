## Documentação Recomendada por Porte de Projeto

| Documento                      | Pequeno | Médio | Grande | Descrição breve                                                                                  |
|---------------------------------|:-------:|:-----:|:------:|--------------------------------------------------------------------------------------------------|
| README.md                       |   ✔️    |  ✔️   |  ✔️    | Visão geral, uso e instalação                                                                    |
| LICENSE                         |   ✔️    |  ✔️   |  ✔️    | Licença do projeto                                                                               |
| .gitignore                      |   ✔️    |  ✔️   |  ✔️    | Arquivos a serem ignorados pelo Git                                                              |
| CHANGELOG.md                    |   🟡    |  ✔️   |  ✔️    | Histórico de mudanças                                                                            |
| CONTRIBUTING.md                 |         |  ✔️   |  ✔️    | Guia de contribuição                                                                             |
| CODE_OF_CONDUCT.md              |         |  ✔️   |  ✔️    | Código de conduta                                                                                |
| ISSUE_TEMPLATE(S)/PR_TEMPLATE   |         |  ✔️   |  ✔️    | Modelos para issues e PRs                                                                        |
| FAQ.md                          |         |  🟡   |  🟡    | Perguntas frequentes                                                                             |
| docs/                           |   🟡    |  ✔️   |  ✔️    | Documentação detalhada e exemplos                                                                |
| ARCHITECTURE.md                 |         |  ✔️   |  ✔️    | Detalhes técnicos da arquitetura                                                                 |
| ROADMAP.md                      |   🟡    |  ✔️   |   ✔️   | Objetivos a serem alcançados ([exemplo](https://github.com/facebook/react/blob/main/compiler/docs/DESIGN_GOALS.md)) |
| SECURITY.md                     |         |  🟡   |  ✔️    | Políticas de segurança e reporte de vulnerabilidades                                             |
| SUPPORT.md                      |         |  🟡   |  ✔️    | Como obter suporte                                                                               |
| GOVERNANCE.md                   |         |       |  ✔️    | Como decisões são tomadas, a estrutura de liderança e como mudanças são processadas              |
| Release notes                   |         |  🟡   |  ✔️    | Notas detalhadas de cada versão/release                                                          |
| Internacionalização             |         |       |  🟡    | Suporte a vários idiomas (quando relevante)                                                      |
| Testes/CI                       |         |  🟡   |  ✔️    | Documentação de como rodar os testes e como eles são automatizados no projeto                    |

**Legenda:**  
✔️ = Recomendado  
🟡 = Opcional/Sugerido  
(em branco) = Não é esperado para esse porte de projeto

---

## Critérios de Classificação de Porte do Projeto

| Critério                | Pequeno         | Médio               | Grande                      |
|-------------------------|-----------------|---------------------|-----------------------------|
| **Contribuidores**      | 1–10            | 11–100              | > 100                       |
| **Commits**             | < 100           | 100 – 2.000         | > 2.000                     |
| **Complexidade**        | Simples (poucas pastas, poucos módulos) | Moderada (algumas camadas/modularização) | Alta (múltiplos módulos, subprojetos, integração complexa) |

> **Classificação:**  
> Será feita pelo Copilot com base nesses critérios.
---
> Lembrando que é uma sugestão; podem haver variações de acordo com a organização desenvolvedora!

---

## Exemplo de Checklist Visual para Usuário

| Item                   | Onde procurar                         | Pode ser substituído por site externo? |
|------------------------|---------------------------------------|:--------------------------------------:|
| README.md              | Raiz                                  | Não                                   |
| LICENSE                | Raiz                                  | Não                                   |
| CONTRIBUTING.md        | Raiz ou .github/                      | Não Recomendado                       |
| CODE_OF_CONDUCT.md     | Raiz ou .github/                      | Não Recomendado                       |
| SECURITY.md            | Raiz ou .github/                      | Não Recomendado                       |
| docs/                  | docs/, wiki, GitHub Pages             | Sim                                   |
| ISSUE_TEMPLATE/        | .github/ ou raiz                      | Não Recomendado                       |
| PULL_REQUEST_TEMPLATE.md| .github/ ou raiz                     | Não Recomendado                       |
| FAQ.md                 | Raiz, docs/, wiki, site externo       | Sim                                   |
| ARCHITECTURE.md        | Raiz, docs/, wiki, site externo       | Sim                                   |
| ROADMAP.md             | Raiz, docs/, Projects, wiki, site     | Sim                                   |
| GOVERNANCE.md          | Raiz, docs/, wiki, site externo       | Sim                                   |
| SUPPORT.md             | Raiz, docs/, wiki, site externo       | Sim                                   |
| CHANGELOG.md           | Raiz, releases, docs/, site externo   | Sim                                   |

---

## Exemplos de Projetos

- Pequeno: [https://rstacruz.github.io/nprogress/](https://rstacruz.github.io/nprogress/)
- Médio: [https://github.com/axios/axios](https://github.com/axios/axios)
- ROADMAP.md exemplo: [https://github.com/facebook/react/blob/main/compiler/docs/DESIGN_GOALS.md](https://github.com/facebook/react/blob/main/compiler/docs/DESIGN_GOALS.md)

---

