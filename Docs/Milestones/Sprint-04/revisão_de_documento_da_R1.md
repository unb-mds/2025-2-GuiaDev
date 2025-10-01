# 📑 Revisão de Documentos para R1

## 📌 Sprint 00

### Documento de Tecnologias (Front-end e Back-end)
- Está bem completo e de fácil entendimento.
- **Sugestão:** apenas formatar em Markdown para exibição correta no GitHub.

### Documento de GitHub
- Muito bem feito, com exemplos de código e passo a passo prático.
- Facilita bastante para quem nunca utilizou o GitHub.

### Documento de Requisitos
- Está bom, mas poderia ser melhorado adicionando:
  - Classificação avançada
  - Priorização
  - Critérios de aceitação
  - Rastreabilidade
  - Validação e gerenciamento de mudanças
  - Representações gráficas
  - Restrições

### Tutorial de Web Scraping
- Bem explicado, fácil de entender e completo

---

## 📌 Sprint 01

### Documento de Docker
- Muito bom, cobre o essencial para levantar uma aplicação full stack (frontend, backend e banco com docker-compose)
- **Sugestões de melhoria:**
  - Ajustar detalhes como `__name__`, `console.log` e acesso ao backend no `fetch`.
- **Para produção:**
  - Usar variáveis em `.env` (senhas)
  - Adicionar `healthcheck`
  - Considerar redes internas entre containers para maior segurança

### Documento de React
- Explicação clara, com exemplo de aplicação funcional

### Documento de Nest.js
- Bem elaborado, cobre os principais pontos

---

## 📌 Sprint 02

### Documento de Requisitos (Escrita Técnica)
- Muito bom, aborda prioridades, requisitos funcionais e público-alvo
- Completo, não necessita de alterações grandes

### Estudo de Arquitetura (Monolito vs Microserviços)
- Apresenta vantagens e desvantagens de forma clara
- Considerado completo e satisfatório

### Documento de Requisitos Não Funcionais
- Precisa apenas de ajuste de formatação em texto Markdown no GitHub

---

## 📌 Sprint 03

### Documento geral sobre o projeto
- Bom como consolidação
- Pode ser expandido com:
  - Resumo das lições aprendidas
  - Próximos passos

---

## 🎨 Documento do Figma

### 🔧 O que precisa ser preenchido no Figma para R1

#### Fluxos de navegação completos
- Linkar botões no protótipo:
  - `"Entrar"` → Dashboard
  - `"Criar conta"` → Cadastro
- Simular navegação no modo protótipo

#### Estados alternativos das telas
- Login com erro (senha incorreta, campos vazios)
- Cadastro inválido (e-mail já cadastrado, senha fraca)
- Dashboard vazio (sem repositórios)
- Dashboard em carregamento

#### Componentes reutilizáveis (Design System no Figma)
- Botões (primário, secundário, desabilitado)
- Campos de texto (normal, foco, erro)
- Cards de repositórios
- Cabeçalho e rodapé padronizados

#### Paleta de cores e tipografia documentada
- Azul principal (`#0d6efd` ou equivalente)
- Tons de cinza para textos secundários
- Fonte utilizada (Inter, Roboto ou similar)

#### Responsividade (opcional, mas agrega valor)
- Versões mobile das telas principais (login, cadastro, dashboard)

#### Anotações de handoff para devs
- Medidas (botões, inputs, cards)
- Definições de espaçamentos (padding, margin)
- Exportação de ícones e logos

---

## 🌐 Documento do GitHub Pages

### 📍 O que observei
- Página inicial traz informações de equipe, visão geral e tecnologias
- Seções “Links úteis”, “Documentação”, “Protótipo”, “Arquitetura” estão incompletas
- Alguns títulos estão genéricos (ex: “Protótipo::”, “Arquitetura:”)
- Navegação ainda depende de links externos incompletos
- Layout funciona como documentação estática, mas falta usabilidade, clareza e interatividade

### 🚀 O que melhorar
- Completar seções sem conteúdo
- Adicionar diagrama de arquitetura (fluxos de dados, camadas, microsserviços)
- Exibir o protótipo final com embed interativo do Figma
- Revisar todos os links (evitar “clique aqui”)
- Organizar melhor a documentação: requisitos, sprints, diagramas, APIs
- Unificar tema visual (cores, fontes, logos)
- Explicar funcionalidades, fluxos de usuário e casos de uso
- Melhorar responsividade para telas menores
- Adicionar histórico do projeto (changelog, evolução)
- Corrigir o nome para `GuiaDev`

### 🛠️ Como fazer
- Inserir imagens, diagramas e links ativos no conteúdo
- Exportar diagramas da arquitetura em SVG ou PNG
- Embed do Figma ou hospedagem de protótipo navegável
- Verificar todos os links para não deixá-los quebrados
- Criar navegação por menu (ex: requisitos, arquitetura, sprints)
- Aplicar guia de estilo com cores e tipografia consistentes
- Incluir seções como: “Como funciona”, “Exemplos de uso”, “Casos de usuário”
- Adicionar meta tags, favicon e descrições para SEO
- Testar responsividade no celular
- Implementar boas práticas de acessibilidade (alt em imagens, contraste, `aria-labels`)
