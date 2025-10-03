# Use uma imagem base do Node.js
FROM node:20-alpine

# Instala o pnpm globalmente dentro do container
RUN npm install -g pnpm

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependências primeiro
# 'pnpm-lock.yaml' garante que todos que trabalham no projeto usem exatamente as mesmas versões de todas as dependências.
COPY package.json pnpm-lock.yaml ./

# Instala as dependências do projeto
RUN pnpm install

# Copia o resto do código da sua aplicação para o diretório de trabalho
COPY . .

# Gera o Prisma Client baseado no seu schema.prism
RUN pnpm exec prisma generate

EXPOSE 3000

# Comando para iniciar a aplicação em modo de desenvolvimento (com hot-reload)
CMD ["pnpm", "run", "start:dev"]