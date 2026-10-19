const express = require('express');
const cors = require('cors');
const MemoryRepository = require('./repositories/MemoryRepository');
const AlunoService = require('./services/AlunoService');
const TurmaService = require('./services/TurmaService');
const ChamadaService = require('./services/ChamadaService');
const alunosRoutes = require('./routes/alunos');
const turmasRoutes = require('./routes/turmas');
const errorHandler = require('./middleware/errorHandler');

/**
 * Monta a aplicacao em camadas: rotas (apresentacao/API) -> services (regra de negocio)
 * -> repositorios (dados). Os repositorios sao injetaveis para facilitar testes.
 */
function createApp({ alunoRepo, turmaRepo, chamadaRepo } = {}) {
  alunoRepo = alunoRepo || new MemoryRepository();
  turmaRepo = turmaRepo || new MemoryRepository();
  chamadaRepo = chamadaRepo || new MemoryRepository();

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
