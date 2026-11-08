const { Router } = require('express');
const h = require('../middleware/asyncHandler');

const resumo = (t) => ({
  id: t.id, nome: t.nome, categoria: t.categoria, local: t.local, vagas: t.vagas,
  vagasOcupadas: t.getVagasOcupadas(), vagasDisponiveis: t.getVagasDisponiveis(),
  alunos: t.listarAlunos(),
});

module.exports = (turmaService, chamadaService) => {
  const r = Router();
  r.post('/', h(async (req, res) => res.status(201).json(resumo(await turmaService.cadastrar(req.body)))));
  r.get('/', h(async (req, res) => res.json((await turmaService.listar()).map(resumo))));
  r.get('/:id', h(async (req, res) => res.json(resumo(await turmaService.buscar(req.params.id)))));
  r.post('/:id/alunos', h(async (req, res) =>
    res.status(201).json(resumo(await turmaService.matricular(req.params.id, (req.body || {}).alunoId)))));
  r.delete('/:id/alunos/:alunoId', h(async (req, res) =>
    res.json(resumo(await turmaService.desmatricular(req.params.id, req.params.alunoId)))));
  r.post('/:id/chamadas', h(async (req, res) =>
    res.status(201).json(await chamadaService.registrar({ ...(req.body || {}), turmaId: req.params.id }))));
  r.get('/:id/chamadas', h(async (req, res) => res.json(await chamadaService.listarPorTurma(req.params.id))));
  return r;
};
