const MemoryRepository = require('./MemoryRepository');

/** Repositorio de chamadas em memoria (com consulta por turma). */
class MemoryChamadaRepository extends MemoryRepository {
  async listarPorTurma(turmaId) {
    return (await this.listar()).filter((c) => c.turmaId === String(turmaId));
  }
}
module.exports = MemoryChamadaRepository;
