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
├── Jenkinsfile                # Esteira de CI: instala dependências e roda os testes a cada build
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

A esteira do projeto roda em um pipeline Jenkins (`Jenkinsfile`), com três estágios:

1. **Checkout** — clona o código diretamente deste repositório.
2. **Instalar dependências** — executa `npm install`.
3. **Executar testes (Jest)** — executa `npm test` e falha o build se algum teste quebrar.

O pipeline é do tipo *Pipeline script from SCM*, apontando para este repositório, e usa a instalação Node.js configurada no Jenkins (ferramenta `Node20`).

## Documentação

O levantamento de requisitos, wireframes, modelagem UML e arquitetura do sistema estão documentados na entrega TG1 do projeto.
