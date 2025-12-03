# Usa uma imagem base leve do Node.js
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependências para NPM
# O 'package-lock.json' é o arquivo de lock do NPM, crucial para builds consistentes.
COPY package.json package-lock.json ./

# Instala as dependências usando NPM.
RUN npm install --no-audit --no-fund

# Copia o resto do código da sua aplicação
COPY . .

# Expõe a porta que o Vite (servidor de dev do React) usa
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento com NPM
# O '--host' é ESSENCIAL para que o servidor seja acessível de fora do container
CMD ["npm", "run", "dev", "--", "--host"]
