const { Router } = require('express');
const h = require('../middleware/asyncHandler');
const { exigirPerfil } = require('../middleware/auth');
const { ForbiddenError } = require('../errors');

const resumo = (t) => ({
  id: t.id, nome: t.nome, categoria: t.categoria, local: t.local, vagas: t.vagas,
  professorId: t.professorId,
  vagasOcupadas: t.getVagasOcupadas(), vagasDisponiveis: t.getVagasDisponiveis(),
  alunos: t.listarAlunos(),
});

/**
 * Turmas e chamadas.
 * - ADMIN: tudo.
 * - PROFESSOR: ve e faz chamada apenas das turmas em que e o professor.
 */
module.exports = (turmaService, chamadaService) => {
  const r = Router();
  const admin = exigirPerfil('ADMIN');
  const adminOuProfessor = exigirPerfil('ADMIN', 'PROFESSOR');

  const ehDoProfessor = (turma, usuario) => turma.professorId === String(usuario.id);
  // Carrega a turma e barra o professor que nao e o responsavel por ela.
  const turmaPermitida = async (req) => {
    const turma = await turmaService.buscar(req.params.id);
    if (req.usuario.perfil === 'PROFESSOR' && !ehDoProfessor(turma, req.usuario)) {
      throw new ForbiddenError('Voce so pode acessar as turmas em que e o professor.');
    }
    return turma;
  };

  r.post('/', admin, h(async (req, res) => res.status(201).json(resumo(await turmaService.cadastrar(req.body)))));
  r.get('/', adminOuProfessor, h(async (req, res) => {
    const turmas = await turmaService.listar();
    const visiveis = req.usuario.perfil === 'PROFESSOR'
      ? turmas.filter((t) => ehDoProfessor(t, req.usuario))
      : turmas;
    res.json(visiveis.map(resumo));
  }));
  r.get('/:id', adminOuProfessor, h(async (req, res) => res.json(resumo(await turmaPermitida(req)))));
  r.put('/:id/professor', admin, h(async (req, res) =>
    res.json(resumo(await turmaService.definirProfessor(req.params.id, (req.body || {}).professorId)))));
  r.post('/:id/alunos', admin, h(async (req, res) =>
    res.status(201).json(resumo(await turmaService.matricular(req.params.id, (req.body || {}).alunoId)))));
  r.delete('/:id/alunos/:alunoId', admin, h(async (req, res) =>
    res.json(resumo(await turmaService.desmatricular(req.params.id, req.params.alunoId)))));
  r.post('/:id/chamadas', adminOuProfessor, h(async (req, res) => {
    await turmaPermitida(req);
    res.status(201).json(await chamadaService.registrar({ ...(req.body || {}), turmaId: req.params.id }));
  }));
  r.get('/:id/chamadas', adminOuProfessor, h(async (req, res) => {
    await turmaPermitida(req);
    res.json(await chamadaService.listarPorTurma(req.params.id));
  }));
  return r;
};
