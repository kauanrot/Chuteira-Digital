# Chuteira Digital ⚽

Sistema web para gestão administrativa e operacional de uma escola de futebol, desenvolvido como projeto da disciplina de **Laboratório de Engenharia de Software** (Universidade Presbiteriana Mackenzie).

O objetivo é substituir o controle manual em planilhas e cadernos por um ambiente único, facilitando o cadastro de alunos, professores e turmas, o controle de presença e o acompanhamento financeiro (mensalidades, bolsas e doações).

## Integrantes

| Nome | RA |
|---|---|
| Kauan Rotondaro Dias Alves | 10440110 |
| Gabriel Medina Peres | 10426931 |
| Kaiki Bellini Barbosa | 10402509 |

## Funcionalidades previstas

- Gestão de usuários e perfis de acesso (Administrador, Professor, Aluno/Responsável)
- Cadastro e gestão de alunos, turmas e professores
- Controle de presença (chamada)
- Gestão de mensalidades, bolsistas e doações
- Dashboard e relatórios de gestão

## Arquitetura e tecnologias

Arquitetura cliente-servidor em três camadas (apresentação, aplicação e dados), com o front-end consumindo uma API REST própria.

| Camada | Tecnologia |
|---|---|
| Front-end | React + Vite |
| Back-end | Node.js + Express |
| Banco de dados | PostgreSQL |
| Persistência | Prisma (ORM) |
| Autenticação | JWT + bcrypt |
| Testes | Jest |
| CI/CD | Jenkins |

## Estrutura do repositório

```
.
├── Jenkinsfile          # Esteira de CI (Jenkins)
├── src/                 # Back-end (Express): models, repositories, services, routes
├── tests/               # Testes Jest + Supertest (UC01, UC02, UC03)
├── frontend/            # Front-end React + Vite
├── prisma/              # schema.prisma + migrations (PostgreSQL)
├── Dockerfile           # Imagem da API
├── docker-compose.yml   # Banco + API + front-end em contêineres
├── docs/sprint3/        # Kanban e documentação da Sprint 3
├── TG2/                 # Entrega TG2 (Turma + testes)
└── package.json
```

## Status (Sprint 3)

Casos de uso implementados: **UC01 Cadastrar aluno**, **UC02 Cadastrar turma e matricular aluno** e **UC03 Registrar chamada**. Detalhes em [docs/sprint3/SPRINT3.md](docs/sprint3/SPRINT3.md) e Kanban em [docs/sprint3/KANBAN.md](docs/sprint3/KANBAN.md).

Para executar: `npm start` (API na porta 3000) e `cd frontend && npm install && npm run dev`.

## Executando com Docker (recomendado)

O `docker-compose.yml` sobe o sistema inteiro em três contêineres, cada um com uma única responsabilidade:

| Serviço | Imagem | Porta no host | Função |
|---|---|---|---|
| `db` | `postgres:16` | 5433 | Banco de dados. Os dados ficam no volume nomeado `pgdata` |
| `api` | `Dockerfile` (raiz) | 3000 | API Express + Prisma. Ao iniciar, aplica as migrations (`prisma migrate deploy`) |
| `web` | `frontend/Dockerfile` | 80 | Build do React servido pelo Nginx, que repassa `/api` para o serviço `api` |

```bash
docker compose up -d --build   # constrói as imagens e sobe tudo
docker compose ps              # status dos contêineres
docker compose logs -f api     # logs da API
docker compose down            # para tudo (os dados continuam no volume pgdata)
```

Depois de subir: front-end em http://localhost e API em http://localhost:3000/api/health.

- Usuário, senha, nome do banco e portas podem ser trocados por variáveis no `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DB_PORT`, `API_PORT`, `WEB_PORT`). Veja o `.env.example`.
- `docker compose down -v` **apaga** o volume e, com ele, todos os dados do banco.
- Na AWS (EC2), os mesmos comandos funcionam. Libere no Security Group as portas que forem acessadas de fora (80 para o front-end, 3000 se a API for acessada direto).

## Banco de dados (PostgreSQL + Prisma)

Os repositórios ficam em `src/repositories/`: `prisma/` (PostgreSQL) e as versões em memória, todas com o mesmo contrato assíncrono (`salvar/buscarPorId/listar/remover`). A API usa o PostgreSQL quando `DATABASE_URL` está definida; sem ela, cai para memória.

Para desenvolver sem Docker na API (rodando `npm start` na máquina), basta subir só o banco no Docker:

```bash
cp .env.example .env          # DATABASE_URL já aponta para o banco do Docker (porta 5433)
docker compose up -d db       # sobe apenas o PostgreSQL
npm install                   # também roda "prisma generate"
npm run db:migrate            # aplica as migrations em prisma/migrations
npm start                     # API usando o PostgreSQL
```

- Ao mudar o `schema.prisma`, rode `npm run db:migrate -- --name <descricao>` para gerar uma nova migration.
- Em servidor/produção use `npm run db:deploy` (aplica as migrations sem gerar novas).
- `npm run db:studio` abre o Prisma Studio para inspecionar os dados.

## Como rodar os testes localmente

```bash
npm install
npm test                      # em memória (é o que roda no Jenkins)
```

Para rodar **os mesmos testes contra o PostgreSQL**, aponte `TEST_DATABASE_URL` para um banco exclusivo de testes (ele é truncado a cada teste) com as migrations aplicadas:

```bash
DATABASE_URL="$TEST_DATABASE_URL" npx prisma migrate deploy
npm run test:db
```

## Esteira de CI/CD

A esteira do projeto roda em um pipeline Jenkins (`Jenkinsfile`), com três estágios:

1. **Checkout** — clona o código diretamente deste repositório.
2. **Instalar dependências** — executa `npm install`.
3. **Executar testes (Jest)** — executa `npm test` e falha o build se algum teste quebrar.

O pipeline é do tipo *Pipeline script from SCM*, apontando para este repositório, e usa a instalação Node.js configurada no Jenkins (ferramenta `Node20`).

## Documentação

O levantamento de requisitos, wireframes, modelagem UML e arquitetura do sistema estão documentados na entrega TG1 do projeto.

