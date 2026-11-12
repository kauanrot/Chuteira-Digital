const Turma = require('../models/Turma');
const { AppError, NotFoundError, ConflictError } = require('../errors');
const { validarConta } = require('./contas');

/** UC02 - Cadastrar turma e matricular aluno (UC05 do TG1) */
class TurmaService {
  constructor(turmaRepo, alunoRepo, usuarioRepo) {
    this.turmaRepo = turmaRepo;
    this.alunoRepo = alunoRepo;
    this.usuarioRepo = usuarioRepo;
  }
  async cadastrar(dados) {
    let turma;
    try {
      turma = new Turma(dados || {});
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    const professorId = dados && dados.professorId ? String(dados.professorId) : undefined;
    await validarConta(this.usuarioRepo, professorId, 'PROFESSOR');
    turma.professorId = professorId;
    return this.turmaRepo.salvar(turma);
  }
  /** Define (ou remove, com professorId vazio) o professor responsavel pela turma. */
  async definirProfessor(turmaId, professorId) {
    const turma = await this.buscar(turmaId);
    const id = professorId ? String(professorId) : undefined;
    await validarConta(this.usuarioRepo, id, 'PROFESSOR');
    turma.professorId = id;
    return this.turmaRepo.salvar(turma);
  }
  async listar() {
    return this.turmaRepo.listar();
  }
  async buscar(id) {
    const turma = await this.turmaRepo.buscarPorId(id);
    if (!turma) throw new NotFoundError('Turma nao encontrada.');
    return turma;
  }
  async matricular(turmaId, alunoId) {
    const turma = await this.buscar(turmaId);
    const aluno = await this.alunoRepo.buscarPorId(alunoId);
    if (!aluno) throw new NotFoundError('Aluno nao encontrado.');
    try {
      turma.matricularAluno(aluno);
    } catch (e) {
      throw new ConflictError(e.message);
    }
    return this.turmaRepo.salvar(turma);
  }
  async desmatricular(turmaId, alunoId) {
    const turma = await this.buscar(turmaId);
    if (!turma.removerAluno(String(alunoId))) {
      throw new NotFoundError('Aluno nao esta matriculado nesta turma.');
    }
    return this.turmaRepo.salvar(turma);
  }
}
module.exports = TurmaService;
