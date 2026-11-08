/**
 * Repositorio em memoria. Implementa o mesmo contrato assincrono
 * (salvar/buscarPorId/listar/remover) dos repositorios Prisma, para que
 * services e rotas funcionem igual nos testes e com o PostgreSQL.
 */
class MemoryRepository {
  constructor() {
    this.items = new Map();
    this.seq = 0;
  }
  async salvar(entidade) {
    if (!entidade.id) entidade.id = String(++this.seq);
    this.items.set(entidade.id, entidade);
    return entidade;
  }
  async buscarPorId(id) {
    return this.items.get(String(id)) || null;
  }
  async listar() {
    return [...this.items.values()];
  }
  async remover(id) {
    return this.items.delete(String(id));
  }
}
module.exports = MemoryRepository;
