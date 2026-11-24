# Casos de teste - Chuteira Digital

Testes automatizados com **Jest + Supertest**, executados na esteira (Jenkins) a cada build. Total: **73 casos**, todos passando.

Como rodar: `npm test` (gera o relatorio de cobertura em `coverage/`).

> Observacao: nao foi possivel gravar a esteira rodando no Jenkins, porque o ambiente (Jenkins e Docker) nao estava instalado nem em execucao na maquina usada para a entrega. O video e os prints mostram a execucao local dos mesmos testes automatizados que a esteira roda (npx jest), definida no Jenkinsfile do repositorio.

## UC01 - Cadastrar aluno

Arquivo: `tests/aluno.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-AL-01 | Criar aluno com dados validos | Aluno criado com nome, nascimento e responsavel | Passou |
| CT-AL-02 | Cadastrar aluno sem nome | Erro de validacao: nome obrigatorio | Passou |
| CT-AL-03 | Data de nascimento invalida | Erro de validacao: data invalida | Passou |
| CT-AL-04 | Data de nascimento no futuro | Erro de validacao: data no futuro | Passou |
| CT-AL-05 | Menor de 18 anos sem responsavel | Erro de validacao: responsavel obrigatorio | Passou |
| CT-AL-06 | Maior de 18 anos sem responsavel | Aluno aceito sem responsavel | Passou |
| CT-AL-07 | E-mail em formato invalido | Erro de validacao: e-mail invalido | Passou |
| CT-AL-08 | Calculo da idade a partir do nascimento | Idade correta em anos completos | Passou |
| CT-AL-09 | POST /api/alunos e depois GET /api/alunos | 201 na criacao e aluno presente na lista | Passou |
| CT-AL-10 | POST /api/alunos com dados invalidos | 400 com mensagem de erro | Passou |
| CT-AL-11 | GET /api/alunos/:id inexistente | 404 | Passou |
| CT-AL-12 | PUT /api/alunos/:id | 200 e dados atualizados | Passou |
| CT-AL-13 | Enviar JSON malformado | 400 | Passou |

## UC02 - Cadastrar turma e matricular aluno

Arquivo: `tests/turma.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-TU-01 | Criar turma valida | 201 e vagas disponiveis = total de vagas | Passou |
| CT-TU-02 | Criar turma com dados invalidos | 400 | Passou |
| CT-TU-03 | Matricular aluno em turma com vaga | 201 e vaga ocupada | Passou |
| CT-TU-04 | Matricular o mesmo aluno duas vezes | 409 (matricula duplicada) | Passou |
| CT-TU-05 | Matricular em turma lotada | 409 (sem vagas) | Passou |
| CT-TU-06 | Matricular aluno ou turma inexistente | 404 | Passou |
| CT-TU-07 | Desmatricular aluno | Matricula removida e vaga liberada | Passou |

## UC03 - Registrar chamada

Arquivo: `tests/chamada.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-CH-01 | Contar presentes e ausentes da chamada | Totais corretos | Passou |
| CT-CH-02 | Chamada com data invalida (modelo) | Erro de validacao | Passou |
| CT-CH-03 | Mesmo aluno repetido na chamada | Erro de validacao | Passou |
| CT-CH-04 | Registro de presenca sem valor booleano | Erro de validacao | Passou |
| CT-CH-05 | Registrar chamada marcando so parte dos alunos | 201 e nao informados contam como falta | Passou |
| CT-CH-06 | Incluir aluno nao matriculado na turma | 400 | Passou |
| CT-CH-07 | Segunda chamada na mesma turma e data | 409 (chamada duplicada) | Passou |
| CT-CH-08 | Registrar chamada com data invalida (API) | 400 | Passou |
| CT-CH-09 | Chamada em turma inexistente | 404 | Passou |
| CT-CH-10 | Listar chamadas de uma turma | 200 com as chamadas registradas | Passou |

## Autenticacao (JWT + bcrypt)

Arquivo: `tests/auth.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-AU-01 | Login com e-mail e senha corretos | 200 com token e usuario sem o hash da senha | Passou |
| CT-AU-02 | Gravacao da senha | Senha salva como hash bcrypt, nunca em texto | Passou |
| CT-AU-03 | Login com e-mail em maiusculas | Login aceito (e-mail nao diferencia maiusculas) | Passou |
| CT-AU-04 | Senha errada ou e-mail inexistente | Mesmo 401 nos dois casos | Passou |
| CT-AU-05 | Login sem e-mail ou sem senha | 400 | Passou |
| CT-AU-06 | Muitas tentativas de login erradas | Bloqueio temporario (429) | Passou |
| CT-AU-07 | GET /api/auth/me com token valido | 200 com o usuario logado | Passou |
| CT-AU-08 | Rota protegida sem token | 401 | Passou |
| CT-AU-09 | Token invalido, adulterado ou expirado | 401 | Passou |
| CT-AU-10 | Token com algoritmo "none" | 401 (token recusado) | Passou |
| CT-AU-11 | GET /api/health sem token | 200 (rota publica) | Passou |

## Gestao de usuarios (ADMIN)

Arquivo: `tests/auth.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-US-01 | Admin cadastra e lista usuarios | 201 na criacao e usuario na lista | Passou |
| CT-US-02 | Cadastrar usuario com e-mail repetido | 409 | Passou |
| CT-US-03 | Cadastrar usuario com dados invalidos | 400 | Passou |
| CT-US-04 | Professor tenta gerenciar usuarios | 403 | Passou |

## Permissoes por perfil

Arquivo: `tests/auth.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-PE-01 | Professor lista turmas | Ve apenas as proprias turmas | Passou |
| CT-PE-02 | Professor registra e consulta chamada | Permitido so na propria turma | Passou |
| CT-PE-03 | Professor tenta cadastrar aluno, turma ou matricula | 403 | Passou |
| CT-PE-04 | Admin troca e remove o professor da turma | Turma atualizada | Passou |
| CT-PE-05 | Vincular turma a conta que nao e PROFESSOR | 400 | Passou |
| CT-PE-06 | Vincular aluno a conta que nao e RESPONSAVEL | 400 | Passou |
| CT-PE-07 | Responsavel consulta seus alunos | Ve so os proprios alunos, com turma e presencas | Passou |
| CT-PE-08 | Responsavel tenta acessar alunos, turmas ou chamadas | 403 | Passou |
| CT-PE-09 | Outro perfil acessa a area do responsavel | 403 | Passou |
| CT-PE-10 | Usuario removido usa token ainda valido | 401 (acesso perdido) | Passou |
| CT-PE-11 | Primeira subida sem usuarios | Admin inicial criado so se nao houver usuarios e houver e-mail e senha no .env | Passou |

## Repositorios (memoria e Prisma)

Arquivo: `tests/repositorios.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-RE-01 | Converter ids numericos validos | Id aceito | Passou |
| CT-RE-02 | Ids invalidos ou fora do Int do PostgreSQL | Id rejeitado | Passou |
| CT-RE-03 | Datas AAAA-MM-DD ida e volta no banco | Mesmo dia, sem deslocamento de fuso | Passou |
| CT-RE-04 | Salvar, buscar, listar e remover em memoria | Operacoes funcionam no contrato assincrono | Passou |
| CT-RE-05 | Listar chamadas por turma | Retorna so as chamadas da turma | Passou |

## Modelo Turma (testes da entrega TG2)

Arquivo: `TG2/src/models/Turma.test.js`

| ID | Cenario | Resultado esperado | Status |
|---|---|---|---|
| CT-TG2-01 | Criar turma valida | Turma criada com os dados informados | Passou |
| CT-TG2-02 | Criar turma sem nome | Erro | Passou |
| CT-TG2-03 | Criar turma com vagas invalidas | Erro | Passou |
| CT-TG2-04 | Verificar vaga em turma com vagas | true | Passou |
| CT-TG2-05 | Verificar vaga em turma lotada | false | Passou |
| CT-TG2-06 | Matricular aluno com vaga | Matricula feita | Passou |
| CT-TG2-07 | Matricular em turma lotada | Erro | Passou |
| CT-TG2-08 | Matricular o mesmo aluno duas vezes | Erro | Passou |
| CT-TG2-09 | Remover aluno matriculado | Aluno removido | Passou |
| CT-TG2-10 | Remover aluno nao matriculado | false | Passou |
| CT-TG2-11 | Vagas disponiveis apos matriculas | Calculo correto | Passou |
| CT-TG2-12 | Vagas disponiveis em turma cheia | Zero | Passou |
