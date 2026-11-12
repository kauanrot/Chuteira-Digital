const { Router } = require('express');
const h = require('../middleware/asyncHandler');

/** Area do responsavel: so enxerga os proprios alunos. */
module.exports = (responsavelService) => {
  const r = Router();
  r.get('/alunos', h(async (req, res) => res.json(await responsavelService.resumo(req.usuario.id))));
  return r;
};
