/**
 * Turma
 *
 * Representa uma turma da escola de futebol (RF03, RF04, RF06 do TG1).
 * Concentra a regra de negocio de matricula e controle de vagas
 * (UC05 - Associar aluno a turma), mantendo o front-end e a API livres
 * dessa logica, conforme a camada de "Servicos" descrita na arquitetura.
 */
class Turma {
  constructor({ id, nome, categoria, local, vagas }) {
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      throw new Error('Nome da turma e obrigatorio.');
    }
    if (!categoria || typeof categoria !== 'string' || categoria.trim() === '') {
      throw new Error('Categoria da turma e obrigatoria.');
    }
    if (!Number.isInteger(vagas) || vagas <= 0) {
      throw new Error('Numero de vagas deve ser um inteiro maior que zero.');
    }

    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.local = local;
    this.vagas = vagas;
    this.alunosMatriculados = [];
  }

  /**
   * Indica se a turma ainda possui vaga disponivel.
   */
  verificarVagaDisponivel() {
    return this.alunosMatriculados.length < this.vagas;
  }

  /**
   * Quantidade de vagas ja ocupadas por alunos matriculados.
   */
  getVagasOcupadas() {
    return this.alunosMatriculados.length;
  }

  /**
   * Quantidade de vagas ainda disponiveis para matricula.
   */
  getVagasDisponiveis() {
    return this.vagas - this.alunosMatriculados.length;
  }

  /**
   * Matricula um aluno na turma, respeitando o limite de vagas e
   * impedindo matricula duplicada (RF04).
   */
  matricularAluno(aluno) {
    if (!aluno || !aluno.id) {
      throw new Error('Aluno invalido para matricula.');
    }
    if (!this.verificarVagaDisponivel()) {
      throw new Error(`Turma "${this.nome}" esta lotada, nao ha vagas disponiveis.`);
    }
    const jaMatriculado = this.alunosMatriculados.some((a) => a.id === aluno.id);
    if (jaMatriculado) {
      throw new Error(`Aluno ${aluno.nome || aluno.id} ja esta matriculado nesta turma.`);
    }

    this.alunosMatriculados.push(aluno);
    return true;
  }

  /**
   * Remove um aluno da turma pelo id. Retorna false se o aluno nao
   * estiver matriculado.
   */
  removerAluno(alunoId) {
    const index = this.alunosMatriculados.findIndex((a) => a.id === alunoId);
    if (index === -1) {
      return false;
    }
    this.alunosMatriculados.splice(index, 1);
    return true;
  }

  /**
   * Lista os alunos atualmente matriculados na turma.
   */
  listarAlunos() {
    return [...this.alunosMatriculados];
  }
}

module.exports = Turma;
