const request = require('supertest');
const createApp = require('../src/app');
const Chamada = require('../src/models/Chamada');

describe('Chamada (modelo)', () => {
  test('conta presentes e ausentes', () => {
    const c = new Chamada({ turmaId: '1', data: '2026-10-10', registros: [
      { alunoId: 'a', presente: true }, { alunoId: 'b', presente: false }] });
    expect(c.totalPresentes()).toBe(1);
    expect(c.totalAusentes()).toBe(1);
  });
  test('rejeita data invalida', () => {
    expect(() => new Chamada({ turmaId: '1', data: '10/10/2026', registros: [] })).toThrow('AAAA-MM-DD');
  });
  test('rejeita aluno repetido', () => {
    expect(() => new Chamada({ turmaId: '1', data: '2026-10-10', registros: [
      { alunoId: 'a', presente: true }, { alunoId: 'a', presente: false }] })).toThrow('repetido');
  });
  test('rejeita registro sem booleano', () => {
    expect(() => new Chamada({ turmaId: '1', data: '2026-10-10', registros: [{ alunoId: 'a', presente: 'sim' }] })).toThrow('presente');
  });
});

describe('UC03 - Registrar chamada (API)', () => {
  let app, turma, a1, a2;
  const mk = (n) => ({ nome: n, dataNascimento: '2016-01-01', responsavel: 'Resp' });
  beforeEach(async () => {
    app = createApp();
    turma = (await request(app).post('/api/turmas').send({ nome: 'Sub-10', categoria: 'Sub-10', vagas: 5 })).body;
    a1 = (await request(app).post('/api/alunos').send(mk('Joao'))).body;
    a2 = (await request(app).post('/api/alunos').send(mk('Pedro'))).body;
    await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: a1.id });
    await request(app).post(`/api/turmas/${turma.id}/alunos`).send({ alunoId: a2.id });
  });

  test('registra chamada e marca nao informados como ausentes', async () => {
    const res = await request(app).post(`/api/turmas/${turma.id}/chamadas`)
      .send({ data: '2026-10-10', registros: [{ alunoId: a1.id, presente: true }] });
    expect(res.status).toBe(201);
    expect(res.body.registros).toHaveLength(2);
    expect(res.body.registros.find((r) => r.alunoId === a2.id).presente).toBe(false);
  });
  test('rejeita aluno nao matriculado', async () => {
    const res = await request(app).post(`/api/turmas/${turma.id}/chamadas`)
      .send({ data: '2026-10-10', registros: [{ alunoId: '99', presente: true }] });
    expect(res.status).toBe(400);
  });
  test('rejeita chamada duplicada na mesma data', async () => {
    const body = { data: '2026-10-10', registros: [] };
    await request(app).post(`/api/turmas/${turma.id}/chamadas`).send(body);
    expect((await request(app).post(`/api/turmas/${turma.id}/chamadas`).send(body)).status).toBe(409);
  });
  test('rejeita data invalida', async () => {
    const res = await request(app).post(`/api/turmas/${turma.id}/chamadas`).send({ data: 'x', registros: [] });
    expect(res.status).toBe(400);
  });
  test('turma inexistente retorna 404', async () => {
    const res = await request(app).post('/api/turmas/99/chamadas').send({ data: '2026-10-10', registros: [] });
    expect(res.status).toBe(404);
  });
  test('lista chamadas da turma', async () => {
    await request(app).post(`/api/turmas/${turma.id}/chamadas`).send({ data: '2026-10-10', registros: [] });
    const res = await request(app).get(`/api/turmas/${turma.id}/chamadas`);
    expect(res.body).toHaveLength(1);
  });
});
