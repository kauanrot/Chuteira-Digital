const MemoryRepository = require('./MemoryRepository');

/** Repositorio de usuarios em memoria (com consulta por e-mail). */
class MemoryUsuarioRepository extends MemoryRepository {
  async buscarPorEmail(email) {
    const alvo = String(email || '').trim().toLowerCase();
    return (await this.listar()).find((u) => u.email === alvo) || null;
  }
  async contar() {
    return this.items.size;
  }
}
module.exports = MemoryUsuarioRepository;
