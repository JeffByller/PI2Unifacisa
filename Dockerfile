FROM node:20

WORKDIR /app

# Copia arquivos de dependência primeiro para aproveitar o cache do Docker
COPY backend/package*.json ./backend/

RUN cd backend && npm install

# Copia o restante do código do backend e frontend
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Cria diretório para o banco de dados SQLite persistente
RUN mkdir -p /data

# Variáveis de ambiente padrão
ENV PORT=3000
ENV DATABASE_PATH=/data/database.sqlite
ENV NODE_ENV=production

EXPOSE 3000

WORKDIR /app/backend
CMD ["npm", "start"]
