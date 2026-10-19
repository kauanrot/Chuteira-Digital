/**
 * Repositorio em memoria. Implementa o contrato (salvar/buscarPorId/listar)
 * que sera substituido por implementacao Prisma/PostgreSQL nas proximas sprints,
 * sem alterar services e rotas.
 */
class MemoryRepository {
  constructor() {
    this.items = new Map();
    this.seq = 0;
  }
  salvar(entidade) {
    if (!entidade.id) entidade.id = String(++this.seq);
    this.items.set(entidade.id, entidade);
    return entidade;
  }
  buscarPorId(id) {
    return this.items.get(String(id)) || null;
  }
  listar() {
    return [...this.items.values()];
  }
  remover(id) {
    return this.items.delete(String(id));
  }
}
module.exports = MemoryRepository;
