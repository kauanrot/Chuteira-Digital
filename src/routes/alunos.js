const { Router } = require('express');
const h = require('../middleware/asyncHandler');

/** Cadastro de alunos: apenas o administrador (ver src/app.js). */
module.exports = (alunoService) => {
  const r = Router();
  r.post('/', h(async (req, res) => res.status(201).json(await alunoService.cadastrar(req.body))));
  r.get('/', h(async (req, res) => res.json(await alunoService.listar())));
  r.get('/:id', h(async (req, res) => res.json(await alunoService.buscar(req.params.id))));
  r.put('/:id', h(async (req, res) => res.json(await alunoService.atualizar(req.params.id, req.body))));
  return r;
};
