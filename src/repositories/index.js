const MemoryRepository = require('./MemoryRepository');
const MemoryChamadaRepository = require('./MemoryChamadaRepository');
const MemoryUsuarioRepository = require('./MemoryUsuarioRepository');

/** Repositorios em memoria (padrao dos testes e quando nao ha banco configurado). */
function criarRepositoriosMemoria() {
  return {
    alunoRepo: new MemoryRepository(),
    turmaRepo: new MemoryRepository(),
    chamadaRepo: new MemoryChamadaRepository(),
    usuarioRepo: new MemoryUsuarioRepository(),
  };
}

/** Repositorios PostgreSQL via Prisma (carregados sob demanda). */
function criarRepositoriosPrisma(prisma) {
  const PrismaAlunoRepository = require('./prisma/PrismaAlunoRepository');
  const PrismaTurmaRepository = require('./prisma/PrismaTurmaRepository');
  const PrismaChamadaRepository = require('./prisma/PrismaChamadaRepository');
  const PrismaUsuarioRepository = require('./prisma/PrismaUsuarioRepository');
  if (!prisma) prisma = require('./prisma/client').getPrisma();
  return {
    alunoRepo: new PrismaAlunoRepository(prisma),
    turmaRepo: new PrismaTurmaRepository(prisma),
    chamadaRepo: new PrismaChamadaRepository(prisma),
    usuarioRepo: new PrismaUsuarioRepository(prisma),
  };
}

module.exports = { criarRepositoriosMemoria, criarRepositoriosPrisma };
