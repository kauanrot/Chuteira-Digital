const request = require('supertest');
const createApp = require('../src/app');
const Aluno = require('../src/models/Aluno');

describe('Aluno (modelo)', () => {
  const base = { nome: 'Joao', dataNascimento: '2014-05-10', responsavel: 'Maria' };

  test('cria aluno valido', () => {
    expect(new Aluno(base).nome).toBe('Joao');
  });
  test('exige nome', () => {
    expect(() => new Aluno({ ...base, nome: ' ' })).toThrow('Nome');
  });
  test('rejeita data invalida', () => {
    expect(() => new Aluno({ ...base, dataNascimento: 'abc' })).toThrow('Data');
  });
  test('rejeita data futura', () => {
    expect(() => new Aluno({ ...base, dataNascimento: '2999-01-01' })).toThrow('futuro');
  });
  test('menor exige responsavel', () => {
    expect(() => new Aluno({ nome: 'Joao', dataNascimento: '2014-05-10' })).toThrow('Responsavel');
  });
  test('maior de idade dispensa responsavel', () => {
    expect(() => new Aluno({ nome: 'Ana', dataNascimento: '1990-01-01' })).not.toThrow();
  });
  test('rejeita e-mail invalido', () => {
    expect(() => new Aluno({ ...base, email: 'x' })).toThrow('E-mail');
  });
  test('calcula idade', () => {
    expect(new Aluno(base).getIdade(new Date('2024-05-09'))).toBe(9);
    expect(new Aluno(base).getIdade(new Date('2024-05-10'))).toBe(10);
  });
});

describe('UC01 - Cadastrar aluno (API)', () => {
  let app;
  beforeEach(() => { app = createApp(); });
  const dados = { nome: 'Joao', dataNascimento: '2014-05-10', responsavel: 'Maria' };

  test('POST cria e GET lista', async () => {
    const criado = await request(app).post('/api/alunos').send(dados);
    expect(criado.status).toBe(201);
    expect(criado.body.id).toBeDefined();
    const lista = await request(app).get('/api/alunos');
    expect(lista.body).toHaveLength(1);
  });
  test('POST invalido retorna 400', async () => {
    const res = await request(app).post('/api/alunos').send({ nome: '' });
    expect(res.status).toBe(400);
    expect(res.body.erro).toBeDefined();
  });
  test('GET inexistente retorna 404', async () => {
    expect((await request(app).get('/api/alunos/99')).status).toBe(404);
  });
  test('PUT atualiza aluno', async () => {
    const { body } = await request(app).post('/api/alunos').send(dados);
    const res = await request(app).put(`/api/alunos/${body.id}`).send({ nome: 'Joao Pedro' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Joao Pedro');
  });
  test('JSON malformado retorna 400', async () => {
    const res = await request(app).post('/api/alunos').set('Content-Type', 'application/json').send('{x');
    expect(res.status).toBe(400);
  });
});
