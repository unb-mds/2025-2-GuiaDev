# Github

Este é um exemplo bem básico que fiz para implementar algumas funcionalidades do git, neste caso estou clonando o repositório principal (criado com git init) e criando um ramo (branch) diferente para não alterar diretamente o ramo principal (main) e evitar possíveis problemas.

Nesse commit adicionei a função multiplicar e irei soliçitar um Pull Request (PR)  para adicionar essa feature (no projeto todos teriam que aceitar a modificação)

passo a passo mais detalhado deste processo:

------
Clone o repositório remoto → assim você tem uma cópia local.

Crie uma branch nova (feature/multiplicacao) → para trabalhar sem mexer diretamente na main (boa prática).

Implemente uma nova funcionalidade .

Faça um commit da mudança com uma mensagem clara.

abra um Pull Request (PR) → para propor a alteração e permitir que os outros membros da equipe revisem/aceitem.

-------
# Resolução de conflito 

->O cenário simulado foi há que dois devs editam a mesma linha (a maioria dos conflitos vão acontecer por causa de um conflito de merge, podendo ser de renomeação, exclusão e etc...)

para acabar com o conflito há 2 escolhas, sendo elas mesclar ou escolher uma. Nesse caso mesclei.

fica assim:

![alt text](image.png)

-------
# Inicio

Irei ressaltar alguns comandos importantes que serão muito usados ao decorrer do projeto, citando algumas formas de usar usando repositório test como exemplo:

-------
# Comandos básicos

* git init: Inicia um novo repositório Git na sua pasta.

* git status: Mostra o estado dos seus arquivos (modificados, adicionados, etc.).

* git add .: Adiciona todos os arquivos modificados para a área de preparação.

* git commit -m "mensagem": Salva as alterações adicionadas como um ponto no histórico.

* git push: Envia os commits da sua máquina para o GitHub.

* git pull: Baixa e mescla as últimas alterações do GitHub para sua máquina.

* git clone [URL]: Cria uma cópia local de um repositório online.

-------
# Branch

branch → uma linha de desenvolvimento paralela (ex: main, dev, feature/nova-funcionalidade).
-> nesse codigo criei e me mudei pra uma branch para adicionar a feature multiplicar

outros comando relacionados a branch:

* git branch                   -> lista branches

* git checkout nome-branch     -> muda para uma branch

* git checkout -b nova-branch  -> cria e entra na nova branch

* git switch nome-branch       -> muda para uma branch (mais seguro que checkout) 

* git merge nome-branch        -> junta outra branch à atual

* git branch -d nome-branch    -> apaga branch local
-------
# Sincronização

Ao decorrer do projeto ocorrerão varias atualizações. Dessa forma, esse comando permite o uso da última versão e atualizar para uma nova versão
->Nesse projeto test usei ambos para atualizar o arquivo devidamente.

comandos: 

* git pull origin main         -> baixa alterações da main

* git push origin nome-branch  -> envia alterações

git fetch ->baixa as últimas alterações de um repositório remoto sem integrá-las ao seu código local.
(funciona como um preview)
--------
# Correção

Usado para quando mandar algo errado ou salvar algo que pode ser usado depois
->Não foi usado no test, porém poderia ter usado caso eu mudasse de ideia e criasse uma feature de divisão ao invés de multiplicação

comandos:

* git reset --soft HEAD~1    -> desfaz último commit mantendo arquivos

* git reset --hard HEAD~1    -> desfaz commit e alterações 

* git stash                  -> guarda alterações temporariamente

* git stash pop              -> recupera alterações guardadas

---------
# Status e histórico

-> usei desses comandos para verificar se os arquivos que eu queria estavam sendo usados (pelo git add) e no final poderia ter usado para ver o histórico de commits e ver o que ja foi implementado.

* git status                 -> mostra arquivos alterados

* git log                    -> mostra histórico de commits (ver o que o outro fez)

* git diff                   -> mostra diferenças nos arquivos

* git rebase                 -> reorganiza o histórico de commits

-------
# Git Hub

O GitHub é muito mais do que só “guardar código”. Ele é uma plataforma de colaboração e gestão de projetos baseada no Git.

Alguns dos aspectos e ferramentas mais importantes do Git Hub.
-----

🔑 1. Repositórios 

Onde o código do projeto fica armazenado.

Cada repositório tem seu histórico de commits, branches, issues etc.
-----

🌳 2. Branches 

Linhas de desenvolvimento independentes dentro do repositório.

Padrão em equipes:

main ou master → versão estável.

dev → versão em desenvolvimento.

feature/* → novas funcionalidades.

hotfix/* → correções rápidas.

----

🔄 3. Pull Requests (PRs)

Forma de propor mudanças em uma branch.

Serve para revisão de código: colegas podem comentar, sugerir melhorias e só depois dar merge.

-------

📝 4. Issues

Ferramenta para relatar problemas, bugs, ou propor novas funcionalidades.

Podem ter labels (ex: bug, enhancement, documentation) e milestones (entregas organizadas e resultado de sprints).

--------

✅ 5. Code Review

Durante o Pull Request, outros membros revisam o código.

Dá pra comentar linhas específicas e pedir ajustes antes do merge, evitando erros em produção.

--------

📦 6. Releases e Tags

Permitem marcar versões específicas do código.

Usado para publicar versões oficiais (ex: v1.0.0).

Pode ser usado para marcar o progresso do projeto (bem opcional)

--------
⚙️ 7. Actions (CI/CD)

Automação dentro do GitHub.

Dá pra rodar testes automáticos, lint, build e até deploy quando alguém faz push ou abre PR.

muito importante para evitar com que o código quebre no merge

-------
👥 8. Colaboração e Permissões

Isso seria uma ordem de prioridade e funções. Nesse caso usaremos a metodologia sprum e iremos nos organizar.

----------

📊 9. Insights e Analytics

Mostra estatísticas de contribuições, commits, branches e atividade.

Isso serve pra ver se todo mundo ta botando a mão na massa.

----------
📚 10. Wiki e Documentação

O GitHub oferece Wiki interna e o README.md.

README é super importante