# Git e GitHub — Fluxo de Trabalho e Comandos Essenciais

---

## Exemplo Prático
Este é um exemplo básico para implementar algumas funcionalidades do Git:  

1. Clonar o repositório principal (criado com `git init`).  
2. Criar uma nova branch para não alterar diretamente a `main`.  
3. Implementar a função de multiplicar.  
4. Realizar um commit com mensagem clara.  
5. Abrir um Pull Request (PR) para propor a alteração e permitir revisão pela equipe.  

---

## Resolução de Conflitos
Cenário simulado: dois desenvolvedores editaram a mesma linha.  
Esse tipo de conflito ocorre, em geral, durante um merge (pode ser devido a renomeação, exclusão, entre outros).  

Formas de resolver:  
- Mesclar as alterações.  
- Escolher apenas uma versão.  

Neste caso, optou-se por mesclar.  

---

## Comandos Importantes

### Comandos básicos
- `git init`: inicia um novo repositório Git na pasta.  
- `git status`: mostra o estado dos arquivos.  
- `git add .`: adiciona todos os arquivos modificados para a área de preparação.  
- `git commit -m "mensagem"`: salva as alterações como um ponto no histórico.  
- `git push`: envia os commits da máquina para o GitHub.  
- `git pull`: baixa e mescla as últimas alterações do GitHub.  
- `git clone [URL]`: cria uma cópia local de um repositório online.  

### Branch
Uma branch é uma linha de desenvolvimento paralela (ex.: main, dev, feature/nova-funcionalidade).  
Exemplo no projeto: criação de uma branch para adicionar a função de multiplicação.  

Comandos úteis:  
- `git branch`: lista branches.  
- `git checkout nome-branch`: muda para uma branch.  
- `git checkout -b nova-branch`: cria e entra em uma nova branch.  
- `git switch nome-branch`: alternativa mais segura ao checkout.  
- `git merge nome-branch`: junta outra branch à atual.  
- `git branch -d nome-branch`: apaga branch local.  

### Sincronização
Durante o desenvolvimento, é comum precisar atualizar o código com a versão mais recente.  

Comandos:  
- `git pull origin main`: baixa alterações da main.  
- `git push origin nome-branch`: envia alterações para a branch.  
- `git fetch`: baixa as últimas alterações sem integrá-las (pré-visualização).  

### Correção
Útil quando algo errado é enviado ou precisa ser revertido.  

Comandos:  
- `git reset --soft HEAD~1`: desfaz o último commit mantendo arquivos.  
- `git reset --hard HEAD~1`: desfaz commit e alterações.  
- `git stash`: guarda alterações temporariamente.  
- `git stash pop`: recupera alterações guardadas.  

### Status e histórico
Esses comandos auxiliam no controle e verificação do que já foi feito.  

- `git status`: mostra arquivos alterados.  
- `git log`: exibe histórico de commits.  
- `git diff`: mostra diferenças entre versões.  
- `git rebase`: reorganiza o histórico de commits.  

---

## GitHub

O GitHub é uma plataforma de colaboração e gestão de projetos baseada no Git.  
Principais recursos:  

1. **Repositórios**: local onde o código e histórico ficam armazenados.  
2. **Branches**: linhas de desenvolvimento independentes.  
   - main/master → versão estável.  
   - dev → versão em desenvolvimento.  
   - feature/* → novas funcionalidades.  
   - hotfix/* → correções rápidas.  
3. **Pull Requests (PRs)**: forma de propor mudanças em uma branch, permitindo revisão de código.  
4. **Issues**: ferramenta para relatar problemas, propor novas funcionalidades ou documentar tarefas.  
5. **Code Review**: revisão de código durante o PR, permitindo comentários e ajustes antes do merge.  
6. **Releases e Tags**: marcam versões específicas do código (ex.: v1.0.0).  
7. **Actions (CI/CD)**: automação de testes, builds e deploys.  
8. **Colaboração e Permissões**: organização de funções e papéis da equipe.  
9. **Insights e Analytics**: estatísticas de contribuições, commits e atividade.  
10. **Wiki e Documentação**: suporte a wiki interna e arquivos README.md.  
