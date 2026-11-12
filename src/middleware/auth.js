const asyncHandler = require('./asyncHandler');
const { ForbiddenError, UnauthorizedError } = require('../errors');

/** Exige um token valido (Authorization: Bearer <token>) e carrega req.usuario. */
const autenticar = (authService) => asyncHandler(async (req, res, next) => {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');
  if (tipo !== 'Bearer' || !token) throw new UnauthorizedError('Faca login para continuar.');
  req.usuario = await authService.autenticar(token);
  next();
});

/** Exige que o usuario logado tenha um dos perfis informados. */
const exigirPerfil = (...perfis) => (req, res, next) => {
  if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
    return next(new ForbiddenError('Seu perfil nao tem permissao para esta acao.'));
  }
  next();
};

module.exports = { autenticar, exigirPerfil };
