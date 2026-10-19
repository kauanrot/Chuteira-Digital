const { Router } = require('express');

module.exports = (alunoService) => {
  const r = Router();
  r.post('/', (req, res) => res.status(201).json(alunoService.cadastrar(req.body)));
  r.get('/', (req, res) => res.json(alunoService.listar()));
  r.get('/:id', (req, res) => res.json(alunoService.buscar(req.params.id)));
  r.put('/:id', (req, res) => res.json(alunoService.atualizar(req.params.id, req.body)));
  return r;
};
