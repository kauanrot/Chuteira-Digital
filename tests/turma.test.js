const request = require('supertest');
const createApp = require('../src/app');

describe('UC02 - Cadastrar turma e matricular aluno (API)', () => {
  let app, turma, aluno;
  beforeEach(async () => {
    app = createApp();
    turma = (await request(app).post('/api/turmas').send({ nome: 'Sub-10', categoria: 'Sub-10', vagas: 1 })).body;
    aluno = (await request(app).post('/api/alunos').send({ nome: 'Joao', dataNascimento: '2016-01-01', responsavel: 'Maria' })).body;
  });

  test('cria turma com vagas disponiveis', () => {
    expect(turma.vagasDisponiveis).toBe(1);
  });
  test('turma invalida retorna 400', async () => {
    const res = await request(app).post('/api/turmas').send({ nome: 'X', categoria: 'Y', vagas: 0 });
    expect(res.status).toBe(400);
  });
  test('matricula aluno', async () => {
    const res = await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: aluno.id });
    expect(res.status).toBe(201);
    expect(res.body.vagasOcupadas).toBe(1);
  });
  test('impede matricula duplicada', async () => {
    await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: aluno.id });
    const res = await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: aluno.id });
    expect(res.status).toBe(409);
  });
  test('impede matricula em turma lotada', async () => {
    const outro = (await request(app).post('/api/alunos').send({ nome: 'Pedro', dataNascimento: '2016-02-02', responsavel: 'Ana' })).body;
    await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: aluno.id });
    const res = await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: outro.id });
    expect(res.status).toBe(409);
    expect(res.body.erro).toMatch(/lotada/);
  });
  test('aluno ou turma inexistente retorna 404', async () => {
    expect((await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: '99' })).status).toBe(404);
    expect((await request(app).post('/api/turmas/99/alunos').send({ alunoId: aluno.id })).status).toBe(404);
  });
  test('desmatricula aluno', async () => {
    await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: aluno.id });
    const res = await request(app).delete(`/api/turmas/${turma.id}/alunos/${aluno.id}`);
    expect(res.body.vagasOcupadas).toBe(0);
    expect((await request(app).delete(`/api/turmas/${turma.id}/alunos/${aluno.id}`)).status).toBe(404);
  });
});
