// Express 4 nao captura erros de handlers async: encaminha a rejeicao ao errorHandler.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
