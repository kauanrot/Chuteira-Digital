/**
 * Cria o app para os testes de API.
 * - Padrao: repositorios em memoria (rapido, sem banco; e o que roda no Jenkins).
 * - Com TEST_DATABASE_URL: os MESMOS testes rodam contra o PostgreSQL via Prisma.
 *   O banco e truncado antes de cada teste, entao use um banco exclusivo de testes.
 *
 * As rotas exigem login. `novoApp()` devolve um app que ja envia o token de um
 * administrador de teste em toda requisicao sem Authorization, para os testes
 * de regra de negocio nao repetirem o login. `novoAppSemLogin()` devolve o app
 * cru, para os testes de autenticacao e de perfis.
 */
const express = require('express');
const createApp = require('../../src/app');
const { criarRepositoriosPrisma } = require('../../src/repositories');

const OPCOES = { jwtSecret: 'segredo-apenas-para-testes', custoBcrypt: 4 };
const ADMIN = { nome: 'Admin Teste', email: 'admin@teste.local', senha: 'senha-de-teste', perfil: 'ADMIN' };

let prisma;

async function novoAppSemLogin() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) return createApp({}, OPCOES);

  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({ datasourceUrl: url });
  }
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Presenca", "Chamada", "Matricula", "Turma", "Aluno", "Usuario" RESTART IDENTITY CASCADE',
  );
  return createApp(criarRepositoriosPrisma(prisma), OPCOES);
}

/** Cadastra um usuario direto no servico e devolve { usuario, token }. */
async function criarUsuario(app, dados) {
  const { authService } = app.locals;
  const usuario = await authService.cadastrar(dados);
  return { usuario, token: authService.gerarToken(usuario) };
}

async function novoApp() {
  const app = await novoAppSemLogin();
  const { token } = await criarUsuario(app, ADMIN);
  const comAdmin = express();
  comAdmin.use((req, res, next) => {
    if (!req.headers.authorization) req.headers.authorization = `Bearer ${token}`;
    next();
  });
  comAdmin.use(app);
  comAdmin.locals.authService = app.locals.authService;
  return comAdmin;
}

async function fecharBanco() {
  if (prisma) await prisma.$disconnect();
}

module.exports = { novoApp, novoAppSemLogin, criarUsuario, fecharBanco, ADMIN };
