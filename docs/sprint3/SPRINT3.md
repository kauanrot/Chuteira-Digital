# Sprint 3 - Início da implementação (20% do projeto)

## Casos de uso implementados
| UC | Descrição | Endpoints | Tela |
|----|-----------|-----------|------|
| UC01 | Cadastrar aluno | `POST/GET /api/alunos`, `GET/PUT /api/alunos/:id` | Alunos |
| UC02 | Cadastrar turma e matricular aluno | `POST/GET /api/turmas`, `POST /api/turmas/:id/alunos`, `DELETE /api/turmas/:id/alunos/:alunoId` | Turmas |
| UC03 | Registrar chamada | `POST/GET /api/turmas/:id/chamadas` | Chamada |

## Arquitetura aplicada (3 camadas)
- **Apresentação:** React + Vite (`frontend/`), consome a API REST própria via proxy `/api`.
- **Aplicação:** Express — `routes/` (HTTP) → `services/` (regras de negócio) → `models/` (entidades).
- **Dados:** `repositories/` com contrato `salvar/buscarPorId/listar/remover`. Nesta sprint usa memória; `prisma/schema.prisma` já define o modelo PostgreSQL para a Sprint 4.

## Regras de negócio
- Aluno menor de 18 anos exige responsável; data de nascimento não pode ser futura.
- Turma respeita limite de vagas e impede matrícula duplicada (classe `Turma` do TG2).
- Chamada: só alunos matriculados; uma chamada por turma/data; alunos não informados ficam ausentes.

## Como rodar
```bash
npm install && npm test        # testes (Jest + Supertest) com cobertura
npm start                      # API em http://localhost:3000
cd frontend && npm install && npm run dev   # front em http://localhost:5173
```

## CI
O `Jenkinsfile` existente executa `npm install` e `npm test` a cada build; os novos testes entram automaticamente.
