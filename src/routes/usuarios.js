const { Router } = require('express');
const h = require('../middleware/asyncHandler');

/** Gestao de contas: apenas o administrador (ver src/app.js). */
module.exports = (authService) => {
  const r = Router();
  r.get('/', h(async (req, res) => res.json(await authService.listar())));
  r.post('/', h(async (req, res) => res.status(201).json(await authService.cadastrar(req.body))));
  return r;
};
