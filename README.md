# Chuteira Digital ⚽

Sistema web para gestão administrativa e operacional de uma escola de futebol, desenvolvido como projeto da disciplina de **Laboratório de Engenharia de Software** (Universidade Presbiteriana Mackenzie).

O objetivo é substituir o controle manual em planilhas e cadernos por um ambiente único, facilitando o cadastro de alunos, professores e turmas, o controle de presença e o acompanhamento financeiro (mensalidades, bolsas e doações).

**Sistema no ar (AWS):** http://3.134.155.227

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
| Hospedagem | AWS EC2 + Docker Compose |

## Estrutura do repositório

```
.
├── Jenkinsfile          # Esteira de CI/CD (Jenkins): testes + deploy na AWS
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
- Em produção, `JWT_SECRET` é obrigatório e `ADMIN_SENHA` define a senha do administrador criado na primeira execução. O `.env` **não** é versionado.
- `docker compose down -v` **apaga** o volume e, com ele, todos os dados do banco.

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

A esteira do projeto roda em um pipeline Jenkins (`Jenkinsfile`), com cinco estágios:

| # | Estágio | O que faz |
|---|---|---|
| 1 | Checkout | Clona o código diretamente deste repositório |
| 2 | Instalar dependencias | Executa `npm install` |
| 3 | Executar testes (Jest) | Executa `npm test` e falha o build se algum teste quebrar |
| 4 | Deploy na AWS (EC2) | Conecta por SSH na EC2, executa `git pull` e `docker compose up -d --build` |
| 5 | Health check | Consulta `/api/health` até a API responder `{"status":"ok"}` |

O pipeline é do tipo *Pipeline script from SCM*, apontando para este repositório, e usa a instalação Node.js configurada no Jenkins (ferramenta `Node20`).

Para o deploy, foi cadastrada no Jenkins uma credencial do tipo *SSH Username with private key* com o ID `ec2-ssh-key` (usuário `ubuntu`), utilizada pelo estágio por meio do `withCredentials`, sem expor a chave no código. As variáveis `EC2_HOST`, `EC2_USER` e `APP_DIR` ficam no bloco `environment` do `Jenkinsfile`.

## Deploy na AWS

O sistema foi publicado em uma instância **Amazon EC2**, executando os mesmos três contêineres do `docker-compose.yml`.

**Endereço do sistema:** http://3.134.155.227
**Health check da API:** http://3.134.155.227/api/health

> O acesso é feito por HTTP (sem HTTPS), pois não foi configurado domínio próprio.

### Arquitetura de deploy

```
GitHub (main) ──► Jenkins (local, Docker) ──SSH──► AWS EC2 (Docker Compose)
                                                     ├─ web  (React + Nginx, porta 80)
                                                     ├─ api  (Node.js + Express + Prisma)
                                                     └─ db   (PostgreSQL 16, volume pgdata)
```

O Nginx do contêiner `web` serve o front-end e repassa as chamadas `/api` para o contêiner `api`. O banco de dados não é exposto à internet.

### Infraestrutura utilizada

| Item | Configuração |
|---|---|
| Serviço | Amazon EC2 |
| Região | us-east-2 (Ohio) |
| Sistema operacional | Ubuntu Server 26.04 LTS |
| Tipo da instância | t3.small (2 GB de RAM) |
| Armazenamento | 20 GiB (gp3) |
| IP | IP elástico (fixo): `3.134.155.227` |
| Security Group | Porta 22 (SSH) e porta 80 (HTTP) |
| Software na instância | Docker e Docker Compose |

### Preparação inicial do servidor (feita uma única vez)

1. Foi criada a instância EC2 com um par de chaves (`.pem`) para acesso SSH.
2. Foram liberadas no Security Group as portas 22 (SSH) e 80 (HTTP).
3. Foi associado um IP elástico à instância, para que o endereço não mude após reinicializações.
4. Foram instalados o Docker, o Docker Compose e o Git:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker ubuntu && sudo systemctl enable --now docker
   ```
5. O projeto foi clonado e configurado:
   ```bash
   git clone https://github.com/kauanrot/Chuteira-Digital.git
   cd Chuteira-Digital
   cp .env.example .env     # ajustar JWT_SECRET e ADMIN_SENHA
   docker compose up -d --build
   ```

As variáveis `JWT_SECRET` e `ADMIN_SENHA` do arquivo `.env` foram alteradas para valores próprios. O arquivo `.env` e a chave `.pem` **não** são versionados no repositório.

### Como publicar uma nova versão

1. Fazer o commit das alterações na branch `main`.
2. No Jenkins, abrir o job `chuteira-digital` e clicar em **Construir agora**.
3. Aguardar os cinco estágios ficarem verdes.
4. Acessar http://3.134.155.227 (recarregar com `Ctrl+Shift+R`) para conferir a atualização.

Caso o IP da instância mude, basta atualizar o `EC2_HOST` no `Jenkinsfile`.

### Comandos úteis no servidor

```bash
docker compose ps               # status dos contêineres
docker compose logs -f api      # logs da API
docker compose restart          # reinicia os serviços
```

> Atenção: `docker compose down -v` apaga o volume `pgdata` e, com ele, todos os dados do banco.

### Observações

- O Jenkins roda localmente, em contêiner Docker, portanto o disparo do deploy é manual (**Construir agora**). O webhook do GitHub não é utilizado, pois o Jenkins local não é acessível pela internet.
- Os dados do banco ficam no volume Docker da própria instância. Em um ambiente de produção, o recomendado seria utilizar o Amazon RDS.
- Em produção, também seria recomendado configurar HTTPS com domínio próprio e restringir o acesso SSH a IPs conhecidos.
- Após a entrega, a instância e o IP elástico devem ser removidos para evitar custos.

## Documentação

O levantamento de requisitos, wireframes, modelagem UML e arquitetura do sistema estão documentados na entrega TG1 do projeto.
