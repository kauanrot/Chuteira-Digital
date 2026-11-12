const { Router } = require('express');
const h = require('../middleware/asyncHandler');
const { autenticar } = require('../middleware/auth');

module.exports = (authService) => {
  const r = Router();
  // Publica: troca e-mail e senha por um token JWT.
  r.post('/login', h(async (req, res) => res.json(await authService.login(req.body))));
  // Quem esta logado (usado pelo front ao abrir a pagina).
  r.get('/me', autenticar(authService), (req, res) => res.json(req.usuario));
  return r;
};
