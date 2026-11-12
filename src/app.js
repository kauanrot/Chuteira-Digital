const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { criarRepositoriosMemoria } = require('./repositories');
const AlunoService = require('./services/AlunoService');
const TurmaService = require('./services/TurmaService');
const ChamadaService = require('./services/ChamadaService');
const AuthService = require('./services/AuthService');
const ResponsavelService = require('./services/ResponsavelService');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const alunosRoutes = require('./routes/alunos');
const turmasRoutes = require('./routes/turmas');
const responsavelRoutes = require('./routes/responsavel');
const { autenticar, exigirPerfil } = require('./middleware/auth');
const limiteLogin = require('./middleware/limiteLogin');
const errorHandler = require('./middleware/errorHandler');

/**
 * Segredo que assina os tokens. Em producao JWT_SECRET e obrigatorio; fora dela,
 * sem a variavel, usa um segredo aleatorio por execucao (os logins caem ao
 * reiniciar a API, mas nenhum segredo fixo fica no codigo).
 */
function resolverSegredo(informado) {
  const segredo = informado || process.env.JWT_SECRET;
  if (segredo) return segredo;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Defina JWT_SECRET para iniciar a API em producao.');
  }
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Monta a aplicacao em camadas: rotas (apresentacao/API) -> services (regra de negocio)
 * -> repositorios (dados). Os repositorios sao injetaveis: em memoria por padrao
 * (testes) ou Prisma/PostgreSQL (ver src/index.js).
 *
 * Acesso por perfil:
 * - ADMIN: tudo (alunos, turmas, matriculas, chamadas, usuarios).
 * - PROFESSOR: turmas em que e o professor e as chamadas delas.
 * - RESPONSAVEL: apenas os proprios alunos (/api/responsavel/alunos).
 */
function createApp(repos = {}, opcoes = {}) {
  const padrao = criarRepositoriosMemoria();
  const alunoRepo = repos.alunoRepo || padrao.alunoRepo;
  const turmaRepo = repos.turmaRepo || padrao.turmaRepo;
  const chamadaRepo = repos.chamadaRepo || padrao.chamadaRepo;
  const usuarioRepo = repos.usuarioRepo || padrao.usuarioRepo;

  const authService = new AuthService(usuarioRepo, {
    segredo: resolverSegredo(opcoes.jwtSecret),
    custo: opcoes.custoBcrypt,
  });
  const alunoService = new AlunoService(alunoRepo, usuarioRepo);
  const turmaService = new TurmaService(turmaRepo, alunoRepo, usuarioRepo);
  const chamadaService = new ChamadaService(chamadaRepo, turmaRepo);
  const responsavelService = new ResponsavelService(alunoRepo, turmaRepo, chamadaRepo);

  const logado = autenticar(authService);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth/login', limiteLogin(opcoes.limiteLogin));
  app.use('/api/auth', authRoutes(authService));
  app.use('/api/usuarios', logado, exigirPerfil('ADMIN'), usuariosRoutes(authService));
  app.use('/api/alunos', logado, exigirPerfil('ADMIN'), alunosRoutes(alunoService));
  app.use('/api/turmas', logado, turmasRoutes(turmaService, chamadaService));
  app.use('/api/responsavel', logado, exigirPerfil('RESPONSAVEL'), responsavelRoutes(responsavelService));
  app.use((req, res) => res.status(404).json({ erro: 'Rota nao encontrada.' }));
  app.use(errorHandler);

  app.locals.authService = authService;
  return app;
}

module.exports = createApp;
