const { Router } = require('express');

const resumo = (t) => ({
  id: t.id, nome: t.nome, categoria: t.categoria, local: t.local, vagas: t.vagas,
  vagasOcupadas: t.getVagasOcupadas(), vagasDisponiveis: t.getVagasDisponiveis(),
  alunos: t.listarAlunos(),
});

module.exports = (turmaService, chamadaService) => {
  const r = Router();
  r.post('/', (req, res) => res.status(201).json(resumo(turmaService.cadastrar(req.body))));
  r.get('/', (req, res) => res.json(turmaService.listar().map(resumo)));
  r.get('/:id', (req, res) => res.json(resumo(turmaService.buscar(req.params.id))));
  r.post('/:id/alunos', (req, res) =>
    res.status(201).json(resumo(turmaService.matricular(req.params.id, (req.body || {}).alunoId))));
  r.delete('/:id/alunos/:alunoId', (req, res) =>
    res.json(resumo(turmaService.desmatricular(req.params.id, req.params.alunoId))));
  r.post('/:id/chamadas', (req, res) =>
    res.status(201).json(chamadaService.registrar({ ...(req.body || {}), turmaId: req.params.id })));
  r.get('/:id/chamadas', (req, res) => res.json(chamadaService.listarPorTurma(req.params.id)));
  return r;
};
