const Turma = require('../models/Turma');
const { AppError, NotFoundError, ConflictError } = require('../errors');

/** UC02 - Cadastrar turma e matricular aluno (UC05 do TG1) */
class TurmaService {
  constructor(turmaRepo, alunoRepo) {
    this.turmaRepo = turmaRepo;
    this.alunoRepo = alunoRepo;
  }
  cadastrar(dados) {
    let turma;
    try {
      turma = new Turma(dados || {});
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    return this.turmaRepo.salvar(turma);
  }
  listar() {
    return this.turmaRepo.listar();
  }
  buscar(id) {
    const turma = this.turmaRepo.buscarPorId(id);
    if (!turma) throw new NotFoundError('Turma nao encontrada.');
    return turma;
  }
  matricular(turmaId, alunoId) {
    const turma = this.buscar(turmaId);
    const aluno = this.alunoRepo.buscarPorId(alunoId);
    if (!aluno) throw new NotFoundError('Aluno nao encontrado.');
    try {
      turma.matricularAluno(aluno);
    } catch (e) {
      throw new ConflictError(e.message);
    }
    return turma;
  }
  desmatricular(turmaId, alunoId) {
    const turma = this.buscar(turmaId);
    if (!turma.removerAluno(String(alunoId))) {
      throw new NotFoundError('Aluno nao esta matriculado nesta turma.');
    }
    return turma;
  }
}
module.exports = TurmaService;
