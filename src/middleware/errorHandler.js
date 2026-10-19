// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON invalido.' });
  }
  const status = err.status || 500;
  const erro = status === 500 ? 'Erro interno do servidor.' : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ erro });
};
