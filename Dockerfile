# syntax=docker/dockerfile:1
# Imagem da API (Node.js + Express + Prisma).
# Build:  docker build -t chuteira-api .
# Normalmente e usada pelo docker-compose.yml (servico "api").
FROM node:22-slim

# O Prisma precisa do OpenSSL para conectar ao PostgreSQL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencias primeiro: essa camada so e refeita quando package*.json ou o schema mudam.
# O "postinstall" do package.json roda "prisma generate" (por isso o schema vem antes).
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force

# Codigo da aplicacao (a classe Turma vem do TG2).
COPY TG2/src ./TG2/src
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Usuario sem privilegios de root.
USER node

# Aplica as migrations pendentes no banco (DATABASE_URL) e sobe a API.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
