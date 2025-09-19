 Projeto Docker Completo: Full Stack com Frontend, Backend e Banco de Dados

Este documento contém toda a configuração e código-fonte para levantar uma aplicação full stack usando Docker e Docker Compose.
1. Visão Geral da Arquitetura

A aplicação é composta por três serviços principais orquestrados pelo Docker Compose:

    frontend: Um servidor Node.js com Express que serve uma página HTML estática.

    backend: Uma API Python com Flask que se conecta a um banco de dados.

    db: Uma instância do banco de dados PostgreSQL.

2. Estrutura de Arquivos

A estrutura de diretórios para este projeto seria a seguinte:

/
├── backend/
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
├── .gitignore
└── docker-compose.yml

3. O Orquestrador: docker-compose.yml

Este é o arquivo principal que define e conecta todos os serviços.

# docker-compose.yml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=meu_usuario
      - POSTGRES_PASSWORD=minha_senha_segura
      - POSTGRES_DB=meu_banco
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    restart: always
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DB_HOST=db
      - DB_USER=meu_usuario
      - DB_PASSWORD=minha_senha_segura
      - DB_NAME=meu_banco
    depends_on:
      - db

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  db_data:

4. Serviço de Backend (Python + Flask)
backend/Dockerfile

Este Dockerfile define o ambiente para a aplicação Python.

# backend/Dockerfile
# Seção 1: Imagem base
FROM python:3.11-slim

# Seção 2: Configuração do ambiente
WORKDIR /app

# Seção 3: Dependências da aplicação (otimizado para cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Seção 4: Código-fonte
COPY . .

# Documenta a porta que a aplicação usa
EXPOSE 8000

# Seção 5: Comando de execução
CMD ["python", "app.py"]

backend/requirements.txt

Lista as dependências Python.

# backend/requirements.txt
Flask
psycopg2-binary

backend/app.py

O código da aplicação Flask que se conecta ao PostgreSQL.

# backend/app.py
import os
import time
from flask import Flask, jsonify
import psycopg2
from psycopg2 import OperationalError

app = Flask(__name__)

def create_conn():
    """Tenta conectar ao banco de dados com retentativas."""
    conn = None
    retries = 5
    while retries > 0:
        try:
            conn = psycopg2.connect(
                host=os.environ.get("DB_HOST"),
                database=os.environ.get("DB_NAME"),
                user=os.environ.get("DB_USER"),
                password=os.environ.get("DB_PASSWORD")
            )
            print("Conexão com o PostgreSQL bem-sucedida!")
            return conn
        except OperationalError as e:
            print(f"Erro ao conectar: {e}. Tentando novamente em 5 segundos...")
            retries -= 1
            time.sleep(5)
    return None

@app.route('/')
def index():
    """Rota principal que verifica a conexão com o banco."""
    conn = create_conn()
    if conn:
        conn.close()
        return jsonify(
            status="success",
            message="Backend está no ar e conectado ao banco de dados PostgreSQL!"
        )
    else:
        return jsonify(
            status="error",
            message="Backend está no ar, mas não foi possível conectar ao banco de dados."
        ), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

5. Serviço de Frontend (Node.js + Express)
frontend/Dockerfile

Define o ambiente para o servidor Node.js.

# frontend/Dockerfile
# Seção 1: Imagem base
FROM node:20-alpine

# Seção 2: Configuração do ambiente
WORKDIR /app

# Seção 3: Dependências da aplicação (otimizado para cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Seção 4: Código-fonte
COPY . .

# Documenta a porta que a aplicação usa
EXPOSE 3000

# Seção 5: Comando de execução
CMD ["node", "server.js"]

frontend/package.json

Define as dependências do Node.js.

# frontend/package.json
{
  "name": "frontend",
  "version": "1.0.0",
  "description": "Serviço de frontend para a aplicação Docker.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}

frontend/server.js

O servidor Express que serve a página principal.

# frontend/server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve arquivos estáticos da pasta atual
app.use(express.static(__dirname));

// Rota principal para servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor frontend rodando em http://localhost:${PORT}`);
});

frontend/index.html

A página que será exibida no navegador. Ela testa a conexão com o backend.

<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Docker Compose</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; color: #333; }
        .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #0d6efd; }
        #status-backend { margin-top: 20px; font-weight: bold; padding: 10px; border-radius: 8px; }
        .success { color: #198754; background-color: #d1e7dd; }
        .error { color: #dc3545; background-color: #f8d7da; }
        .loading { color: #6c757d; background-color: #e2e3e5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Aplicação Full Stack com Docker</h1>
        <p>Esta é a página servida pelo contêiner do <strong>Frontend</strong>.</p>
        <div id="status-backend" class="loading">
            Verificando status do backend...
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const statusDiv = document.getElementById('status-backend');

            fetch('http://localhost:8000')
                .then(response => response.json())
                .then(data => {
                    statusDiv.textContent = data.message;
                    statusDiv.classList.remove('loading');
                    statusDiv.classList.add('success');
                })
                .catch(error => {
                    console.error('Erro ao conectar com o backend:', error);
                    statusDiv.textContent = 'Falha ao conectar com o backend. Verifique o console.';
                    statusDiv.classList.remove('loading');
                    statusDiv.classList.add('error');
                });
        });
    </script>
</body>
</html>

6. Arquivos Adicionais
.gitignore

Para evitar que arquivos desnecessários sejam enviados para o controle de versão.

# .gitignore

# Dependências
node_modules/

# Python
__pycache__/
*.pyc

# Arquivos de ambiente
.env

# Dados do Docker (opcional, mas boa prática)
db_data/

7. Como Executar

    Crie a estrutura de pastas e salve cada trecho de código no arquivo correspondente.

    Abra um terminal na raiz do projeto (onde o docker-compose.yml está localizado).

    Execute o comando:

    docker compose up --build

    Acesse o frontend em http://localhost:3000 no seu navegador.
