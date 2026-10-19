const Aluno = require('../models/Aluno');
const { AppError, NotFoundError } = require('../errors');

/** UC01 - Cadastrar aluno */
class AlunoService {
  constructor(alunoRepo) {
    this.alunoRepo = alunoRepo;
  }
  cadastrar(dados) {
    let aluno;
    try {
      aluno = new Aluno(dados || {});
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    return this.alunoRepo.salvar(aluno);
  }
  listar() {
    return this.alunoRepo.listar();
  }
  buscar(id) {
    const aluno = this.alunoRepo.buscarPorId(id);
    if (!aluno) throw new NotFoundError('Aluno nao encontrado.');
    return aluno;
  }
  atualizar(id, dados) {
    const atual = this.buscar(id);
    try {
      const novo = new Aluno({ ...atual, ...dados, id: atual.id });
      return this.alunoRepo.salvar(novo);
    } catch (e) {
      throw new AppError(e.message, 400);
    }
  }
}
module.exports = AlunoService;
