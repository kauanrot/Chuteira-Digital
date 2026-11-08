# syntax=docker/dockerfile:1
# Imagem do front-end: gera o build do React (Vite) e serve com o Nginx.
# O Nginx tambem repassa /api para o servico "api" do docker-compose.

# Etapa 1: build
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servidor web
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
