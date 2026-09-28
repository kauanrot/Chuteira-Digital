# Chuteira Digital ⚽

![CI](https://github.com/kauanrot/Chuteira-Digital/actions/workflows/ci.yml/badge.svg)

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
| CI/CD | GitHub Actions |

## Estrutura do repositório

```
.
├── .github/workflows/ci.yml # Esteira de CI: instala dependências e roda os testes a cada push/PR
├── TG2/
│   └── src/
│       └── models/
│           ├── Turma.js       # Regra de negócio de matrícula e controle de vagas (entrega TG2)
│           └── Turma.test.js  # Suíte de testes da classe Turma (Jest)
├── package.json
└── .gitignore
```

## Como rodar os testes localmente

```bash
npm install
npm test
```

## Esteira de CI/CD

A cada push ou pull request na branch `main`, o GitHub Actions instala as dependências e executa a suíte de testes automaticamente. O status da última execução aparece no badge no topo deste README.

## Documentação

O levantamento de requisitos, wireframes, modelagem UML e arquitetura do sistema estão documentados na entrega TG1 do projeto.
