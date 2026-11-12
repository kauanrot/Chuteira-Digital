const Aluno = require('../models/Aluno');
const { AppError, NotFoundError } = require('../errors');
const { validarConta } = require('./contas');

/** UC01 - Cadastrar aluno */
class AlunoService {
  constructor(alunoRepo, usuarioRepo) {
    this.alunoRepo = alunoRepo;
    this.usuarioRepo = usuarioRepo;
  }
  async cadastrar(dados) {
    let aluno;
    try {
      aluno = new Aluno(dados || {});
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    await validarConta(this.usuarioRepo, aluno.responsavelUsuarioId, 'RESPONSAVEL');
    return this.alunoRepo.salvar(aluno);
  }
  async listar() {
    return this.alunoRepo.listar();
  }
  async buscar(id) {
    const aluno = await this.alunoRepo.buscarPorId(id);
    if (!aluno) throw new NotFoundError('Aluno nao encontrado.');
    return aluno;
  }
  async atualizar(id, dados) {
    const atual = await this.buscar(id);
    let novo;
    try {
      novo = new Aluno({ ...atual, ...dados, id: atual.id });
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    await validarConta(this.usuarioRepo, novo.responsavelUsuarioId, 'RESPONSAVEL');
    return this.alunoRepo.salvar(novo);
  }
}
module.exports = AlunoService;
