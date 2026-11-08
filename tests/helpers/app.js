/**
 * Cria o app para os testes de API.
 * - Padrao: repositorios em memoria (rapido, sem banco; e o que roda no Jenkins).
 * - Com TEST_DATABASE_URL: os MESMOS testes rodam contra o PostgreSQL via Prisma.
 *   O banco e truncado antes de cada teste, entao use um banco exclusivo de testes.
 */
const createApp = require('../../src/app');
const { criarRepositoriosPrisma } = require('../../src/repositories');

let prisma;

async function novoApp() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) return createApp();

  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({ datasourceUrl: url });
  }
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Presenca", "Chamada", "Matricula", "Turma", "Aluno" RESTART IDENTITY CASCADE',
  );
  return createApp(criarRepositoriosPrisma(prisma));
}

async function fecharBanco() {
  if (prisma) await prisma.$disconnect();
}

module.exports = { novoApp, fecharBanco };
