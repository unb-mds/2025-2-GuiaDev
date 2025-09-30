# Padrão de commits / Commits convencionais

## Estrutura Básica
```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

## Tipos Principais

### Obrigatórios
- **feat:** nova funcionalidade
- **fix:** correção de bug

### Recomendados
- **docs:** alterações na documentação
- **style:** formatação, ponto e vírgula, etc (sem mudança de código)
- **refactor:** refatoração sem adicionar funcionalidade ou corrigir bugs
- **perf:** mudança que melhora performance
- **test:** adição ou correção de testes
- **chore:** alterações no build, ferramentas auxiliares, etc
- **ci:** mudanças nos arquivos e scripts de CI

## Exemplos Práticos

### Básicos
```
feat: adiciona login com Google
fix: corrige erro de validação no formulário
docs: atualiza README com instruções de instalação
refactor: reorganiza estrutura de pastas do projeto
```

### Com Escopo
```
feat(auth): implementa reset de senha
fix(api): corrige timeout nas requisições
style(components): padroniza indentação
```

### Breaking Changes
```
feat!: migra para nova versão da API
```
ou
```
feat: remove suporte ao Internet Explorer

BREAKING CHANGE: navegadores antigos não são mais suportados
```

## Versionamento Semântico (SemVer)

### Estrutura: MAJOR.MINOR.PATCH (ex: 2.1.3)
- **MAJOR (2):** mudanças incompatíveis na API
- **MINOR (1):** novas funcionalidades compatíveis
- **PATCH (3):** correções de bugs compatíveis

### Integração com Conventional Commits
- **fix:** → PATCH (1.0.1)
- **feat:** → MINOR (1.1.0)  
- **BREAKING CHANGE:** → MAJOR (2.0.0)

### Regras Especiais
- Versão 0.x.x = desenvolvimento inicial (instável)
- 1.0.0 = primeira versão estável pública
- Pré-releases: 1.0.0-alpha.1, 1.0.0-beta.2, 1.0.0-rc.1

## Benefícios
- ✅ **Histórico limpo e padronizado**  
- ✅ **Geração automática de changelog**  
- ✅ **Versionamento semântico automático**  
- ✅ **Facilita code review**  
- ✅ **Integração com ferramentas de CI/CD**

## Dicas Importantes
- Use imperativos: "adiciona" ao invés de "adicionado"
- Primeira linha até 50 caracteres
- Corpo opcional para explicar o "porquê"
- Não termine com ponto final
- Seja específico mas conciso

## Configuração Rápida
Para automatizar a validação:
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```
