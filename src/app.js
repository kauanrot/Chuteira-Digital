const express = require('express');
const cors = require('cors');
const { criarRepositoriosMemoria } = require('./repositories');
const AlunoService = require('./services/AlunoService');
const TurmaService = require('./services/TurmaService');
const ChamadaService = require('./services/ChamadaService');
const alunosRoutes = require('./routes/alunos');
const turmasRoutes = require('./routes/turmas');
const errorHandler = require('./middleware/errorHandler');

/**
 * Monta a aplicacao em camadas: rotas (apresentacao/API) -> services (regra de negocio)
 * -> repositorios (dados). Os repositorios sao injetaveis: em memoria por padrao
 * (testes) ou Prisma/PostgreSQL (ver src/index.js).
 */
function createApp(repos = {}) {
  const padrao = criarRepositoriosMemoria();
  const alunoRepo = repos.alunoRepo || padrao.alunoRepo;
  const turmaRepo = repos.turmaRepo || padrao.turmaRepo;
  const chamadaRepo = repos.chamadaRepo || padrao.chamadaRepo;

  const alunoService = new AlunoService(alunoRepo);
  const turmaService = new TurmaService(turmaRepo, alunoRepo);
  const chamadaService = new ChamadaService(chamadaRepo, turmaRepo);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/alunos', alunosRoutes(alunoService));
  app.use('/api/turmas', turmasRoutes(turmaService, chamadaService));
  app.use((req, res) => res.status(404).json({ erro: 'Rota nao encontrada.' }));
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
