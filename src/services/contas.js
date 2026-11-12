const { AppError } = require('../errors');

/**
 * Confere se `usuarioId` (quando informado) e uma conta existente com o perfil
 * esperado. Usado para ligar turma -> professor e aluno -> responsavel.
 */
async function validarConta(usuarioRepo, usuarioId, perfil) {
  if (!usuarioId || !usuarioRepo) return;
  const usuario = await usuarioRepo.buscarPorId(usuarioId);
  if (!usuario || usuario.perfil !== perfil) {
    throw new AppError(`Usuario ${usuarioId} nao e uma conta com perfil ${perfil}.`, 400);
  }
}

module.exports = { validarConta };
