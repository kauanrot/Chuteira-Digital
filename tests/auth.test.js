const request = require('supertest');
const jwt = require('jsonwebtoken');
const { novoAppSemLogin, criarUsuario, fecharBanco, ADMIN } = require('./helpers/app');

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

describe('Autenticacao (JWT + bcrypt)', () => {
  let app, admin;
  beforeEach(async () => {
    app = await novoAppSemLogin();
    admin = await criarUsuario(app, ADMIN);
  });
  afterAll(fecharBanco);

  test('login correto devolve token e usuario sem o hash da senha', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email, senha: ADMIN.senha });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.usuario).toEqual({ id: admin.usuario.id, nome: ADMIN.nome, email: ADMIN.email, perfil: 'ADMIN' });
    expect(JSON.stringify(res.body)).not.toMatch(/senha/i);
  });
  test('a senha e gravada como hash bcrypt, nunca em texto', () => {
    expect(admin.usuario.senhaHash).toMatch(/^\$2[aby]\$/);
    expect(admin.usuario.senhaHash).not.toContain(ADMIN.senha);
  });
  test('e-mail do login nao diferencia maiusculas', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email.toUpperCase(), senha: ADMIN.senha });
    expect(res.status).toBe(200);
  });
  test('senha errada e e-mail inexistente dao o mesmo 401', async () => {
    const errada = await request(app).post('/api/auth/login').send({ email: ADMIN.email, senha: 'outra-senha' });
    const inexistente = await request(app).post('/api/auth/login').send({ email: 'ninguem@teste.local', senha: ADMIN.senha });
    expect(errada.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(errada.body.erro).toBe(inexistente.body.erro);
  });
  test('login sem e-mail ou senha retorna 400', async () => {
    expect((await request(app).post('/api/auth/login').send({ email: ADMIN.email })).status).toBe(400);
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(400);
  });
  test('bloqueia apos muitas tentativas erradas', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/auth/login').send({ email: ADMIN.email, senha: 'chute' });
    }
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email, senha: ADMIN.senha });
    expect(res.status).toBe(429);
  });

  test('/me devolve o usuario logado', async () => {
    const res = await request(app).get('/api/auth/me').set(bearer(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(ADMIN.email);
  });
  test('rota protegida sem token retorna 401', async () => {
    expect((await request(app).get('/api/alunos')).status).toBe(401);
    expect((await request(app).get('/api/turmas')).status).toBe(401);
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });
  test('token invalido, adulterado ou expirado retorna 401', async () => {
    const outroSegredo = jwt.sign({ perfil: 'ADMIN' }, 'outro-segredo', { subject: admin.usuario.id });
    const expirado = jwt.sign({ perfil: 'ADMIN' }, 'segredo-apenas-para-testes', { subject: admin.usuario.id, expiresIn: -10 });
    for (const token of ['lixo', outroSegredo, expirado]) {
      expect((await request(app).get('/api/alunos').set(bearer(token))).status).toBe(401);
    }
  });
  test('token "alg: none" e recusado', async () => {
    const semAssinatura = jwt.sign({ perfil: 'ADMIN' }, '', { subject: admin.usuario.id, algorithm: 'none' });
    expect((await request(app).get('/api/alunos').set(bearer(semAssinatura))).status).toBe(401);
  });
  test('health continua publica', async () => {
    expect((await request(app).get('/api/health')).status).toBe(200);
  });
});

describe('Usuarios (gestao pelo administrador)', () => {
  let app, admin;
  beforeEach(async () => {
    app = await novoAppSemLogin();
    admin = await criarUsuario(app, ADMIN);
  });

  const novo = { nome: 'Prof. Carlos', email: 'carlos@teste.local', senha: 'senha-do-carlos', perfil: 'PROFESSOR' };

  test('admin cadastra e lista usuarios', async () => {
    const criado = await request(app).post('/api/usuarios').set(bearer(admin.token)).send(novo);
    expect(criado.status).toBe(201);
    expect(criado.body).toEqual({ id: expect.any(String), nome: novo.nome, email: novo.email, perfil: 'PROFESSOR' });
    const lista = await request(app).get('/api/usuarios').set(bearer(admin.token));
    expect(lista.body).toHaveLength(2);
    expect(JSON.stringify(lista.body)).not.toMatch(/senha/i);
  });
  test('e-mail repetido retorna 409', async () => {
    await request(app).post('/api/usuarios').set(bearer(admin.token)).send(novo);
    const res = await request(app).post('/api/usuarios').set(bearer(admin.token)).send({ ...novo, email: 'CARLOS@teste.local' });
    expect(res.status).toBe(409);
  });
  test('dados invalidos retornam 400', async () => {
    const enviar = (d) => request(app).post('/api/usuarios').set(bearer(admin.token)).send({ ...novo, ...d });
    expect((await enviar({ senha: 'curta' })).status).toBe(400);
    expect((await enviar({ perfil: 'DIRETOR' })).status).toBe(400);
    expect((await enviar({ email: 'sem-arroba' })).status).toBe(400);
    expect((await enviar({ nome: '' })).status).toBe(400);
  });
  test('professor nao gerencia usuarios', async () => {
    const prof = await criarUsuario(app, novo);
    expect((await request(app).get('/api/usuarios').set(bearer(prof.token))).status).toBe(403);
    expect((await request(app).post('/api/usuarios').set(bearer(prof.token)).send({ ...novo, email: 'x@teste.local', perfil: 'ADMIN' })).status).toBe(403);
  });
});

describe('Permissoes por perfil', () => {
  let app, admin, prof, outroProf, resp, turma, outraTurma, aluno, outroAluno;
  const comoAdmin = (req) => req.set(bearer(admin.token));

  beforeEach(async () => {
    app = await novoAppSemLogin();
    admin = await criarUsuario(app, ADMIN);
    prof = await criarUsuario(app, { nome: 'Prof. Carlos', email: 'carlos@teste.local', senha: 'senha-do-carlos', perfil: 'PROFESSOR' });
    outroProf = await criarUsuario(app, { nome: 'Prof. Bia', email: 'bia@teste.local', senha: 'senha-da-bia', perfil: 'PROFESSOR' });
    resp = await criarUsuario(app, { nome: 'Maria', email: 'maria@teste.local', senha: 'senha-da-maria', perfil: 'RESPONSAVEL' });

    turma = (await comoAdmin(request(app).post('/api/turmas'))
      .send({ nome: 'Sub-10', categoria: 'Sub-10', vagas: 5, professorId: prof.usuario.id })).body;
    outraTurma = (await comoAdmin(request(app).post('/api/turmas'))
      .send({ nome: 'Sub-12', categoria: 'Sub-12', vagas: 5, professorId: outroProf.usuario.id })).body;
    aluno = (await comoAdmin(request(app).post('/api/alunos'))
      .send({ nome: 'Joao', dataNascimento: '2016-01-01', responsavel: 'Maria', responsavelUsuarioId: resp.usuario.id })).body;
    outroAluno = (await comoAdmin(request(app).post('/api/alunos'))
      .send({ nome: 'Pedro', dataNascimento: '2016-02-02', responsavel: 'Ana' })).body;
    await comoAdmin(request(app).post(`/api/turmas/${turma.id}/alunos`)).send({ alunoId: aluno.id });
    await comoAdmin(request(app).post(`/api/turmas/${turma.id}/alunos`)).send({ alunoId: outroAluno.id });
  });

  test('professor ve apenas as proprias turmas', async () => {
    const res = await request(app).get('/api/turmas').set(bearer(prof.token));
    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.id)).toEqual([turma.id]);
    expect((await request(app).get(`/api/turmas/${outraTurma.id}`).set(bearer(prof.token))).status).toBe(403);
  });
  test('professor faz e consulta chamada so da propria turma', async () => {
    const corpo = { data: '2026-10-10', registros: [{ alunoId: aluno.id, presente: true }] };
    expect((await request(app).post(`/api/turmas/${turma.id}/chamadas`).set(bearer(prof.token)).send(corpo)).status).toBe(201);
    expect((await request(app).get(`/api/turmas/${turma.id}/chamadas`).set(bearer(prof.token))).body).toHaveLength(1);
    expect((await request(app).post(`/api/turmas/${outraTurma.id}/chamadas`).set(bearer(prof.token)).send(corpo)).status).toBe(403);
    expect((await request(app).get(`/api/turmas/${outraTurma.id}/chamadas`).set(bearer(prof.token))).status).toBe(403);
  });
  test('professor nao cadastra aluno, turma nem matricula', async () => {
    const t = bearer(prof.token);
    expect((await request(app).get('/api/alunos').set(t)).status).toBe(403);
    expect((await request(app).post('/api/alunos').set(t).send({ nome: 'X', dataNascimento: '2016-01-01', responsavel: 'Y' })).status).toBe(403);
    expect((await request(app).post('/api/turmas').set(t).send({ nome: 'X', categoria: 'Y', vagas: 3 })).status).toBe(403);
    expect((await request(app).post(`/api/turmas/${turma.id}/alunos`).set(t).send({ alunoId: outroAluno.id })).status).toBe(403);
    expect((await request(app).delete(`/api/turmas/${turma.id}/alunos/${aluno.id}`).set(t)).status).toBe(403);
    expect((await request(app).put(`/api/turmas/${outraTurma.id}/professor`).set(t).send({ professorId: prof.usuario.id })).status).toBe(403);
  });
  test('admin troca e remove o professor da turma', async () => {
    const troca = await comoAdmin(request(app).put(`/api/turmas/${turma.id}/professor`)).send({ professorId: outroProf.usuario.id });
    expect(troca.status).toBe(200);
    expect(troca.body.professorId).toBe(outroProf.usuario.id);
    expect((await request(app).get('/api/turmas').set(bearer(prof.token))).body).toHaveLength(0);
    const remove = await comoAdmin(request(app).put(`/api/turmas/${turma.id}/professor`)).send({});
    expect(remove.body.professorId).toBeUndefined();
  });
  test('professor da turma precisa ser uma conta PROFESSOR', async () => {
    const res = await comoAdmin(request(app).put(`/api/turmas/${turma.id}/professor`)).send({ professorId: resp.usuario.id });
    expect(res.status).toBe(400);
    const inexistente = await comoAdmin(request(app).post('/api/turmas')).send({ nome: 'X', categoria: 'Y', vagas: 3, professorId: '999' });
    expect(inexistente.status).toBe(400);
  });
  test('conta ligada ao aluno precisa ser RESPONSAVEL', async () => {
    const res = await comoAdmin(request(app).put(`/api/alunos/${outroAluno.id}`)).send({ responsavelUsuarioId: prof.usuario.id });
    expect(res.status).toBe(400);
  });

  test('responsavel ve apenas os proprios alunos, com turma e presencas', async () => {
    await comoAdmin(request(app).post(`/api/turmas/${turma.id}/chamadas`))
      .send({ data: '2026-10-10', registros: [{ alunoId: aluno.id, presente: true }, { alunoId: outroAluno.id, presente: false }] });
    const res = await request(app).get('/api/responsavel/alunos').set(bearer(resp.token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].aluno.id).toBe(aluno.id);
    expect(res.body[0].turmas.map((t) => t.id)).toEqual([turma.id]);
    expect(res.body[0].presencas).toEqual([{ turmaId: turma.id, data: '2026-10-10', presente: true }]);
    expect(JSON.stringify(res.body)).not.toContain('Pedro');
  });
  test('responsavel nao acessa alunos, turmas nem chamadas', async () => {
    const t = bearer(resp.token);
    expect((await request(app).get('/api/alunos').set(t)).status).toBe(403);
    expect((await request(app).get('/api/turmas').set(t)).status).toBe(403);
    expect((await request(app).get(`/api/turmas/${turma.id}/chamadas`).set(t)).status).toBe(403);
  });
  test('area do responsavel e exclusiva desse perfil', async () => {
    expect((await request(app).get('/api/responsavel/alunos').set(bearer(prof.token))).status).toBe(403);
    expect((await comoAdmin(request(app).get('/api/responsavel/alunos'))).status).toBe(403);
  });

  test('usuario removido perde o acesso mesmo com token valido', async () => {
    const { authService } = app.locals;
    await authService.usuarioRepo.remover(prof.usuario.id);
    expect((await request(app).get('/api/turmas').set(bearer(prof.token))).status).toBe(401);
  });
});

describe('Administrador inicial', () => {
  test('cria o admin so quando nao ha usuarios e ha e-mail e senha', async () => {
    const app = await novoAppSemLogin();
    const { authService } = app.locals;
    expect(await authService.garantirAdminInicial({})).toBeNull();
    const criado = await authService.garantirAdminInicial({ email: 'primeiro@teste.local', senha: 'senha-inicial' });
    expect(criado.perfil).toBe('ADMIN');
    expect(await authService.garantirAdminInicial({ email: 'segundo@teste.local', senha: 'senha-inicial' })).toBeNull();
  });
});
