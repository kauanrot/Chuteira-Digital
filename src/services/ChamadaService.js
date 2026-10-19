const Chamada = require('../models/Chamada');
const { AppError, NotFoundError, ConflictError } = require('../errors');

/** UC03 - Registrar chamada (controle de presenca) */
class ChamadaService {
  constructor(chamadaRepo, turmaRepo) {
    this.chamadaRepo = chamadaRepo;
    this.turmaRepo = turmaRepo;
  }
  /**
   * Alunos matriculados que nao constarem em `registros` sao marcados como ausentes.
   */
  registrar({ turmaId, data, registros }) {
    const turma = this.turmaRepo.buscarPorId(turmaId);
    if (!turma) throw new NotFoundError('Turma nao encontrada.');

    const matriculados = new Set(turma.listarAlunos().map((a) => a.id));
    for (const r of registros || []) {
      if (!matriculados.has(r && r.alunoId)) {
        throw new AppError(`Aluno ${r && r.alunoId} nao esta matriculado na turma.`, 400);
      }
    }
    const duplicada = this.chamadaRepo
      .listar()
      .some((c) => c.turmaId === turma.id && c.data === data);
    if (duplicada) throw new ConflictError('Ja existe chamada para esta turma nesta data.');

    const informados = new Set((registros || []).map((r) => r.alunoId));
    const completos = [
      ...(registros || []),
      ...[...matriculados].filter((id) => !informados.has(id)).map((id) => ({ alunoId: id, presente: false })),
    ];

    let chamada;
    try {
      chamada = new Chamada({ turmaId: turma.id, data, registros: completos });
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    return this.chamadaRepo.salvar(chamada);
  }
  listarPorTurma(turmaId) {
    if (!this.turmaRepo.buscarPorId(turmaId)) throw new NotFoundError('Turma nao encontrada.');
    return this.chamadaRepo.listar().filter((c) => c.turmaId === String(turmaId));
  }
}
module.exports = ChamadaService;
