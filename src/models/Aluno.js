/**
 * Aluno (RF03) - aluno da escola de futebol.
 * Menores de idade precisam ter um responsavel cadastrado.
 */
class Aluno {
  constructor({ id, nome, dataNascimento, responsavel, telefone, email }) {
    if (typeof nome !== 'string' || nome.trim() === '') {
      throw new Error('Nome do aluno e obrigatorio.');
    }
    const nascimento = new Date(dataNascimento);
    if (!dataNascimento || Number.isNaN(nascimento.getTime())) {
      throw new Error('Data de nascimento invalida.');
    }
    if (nascimento > new Date()) {
      throw new Error('Data de nascimento nao pode estar no futuro.');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('E-mail invalido.');
    }

    this.id = id;
    this.nome = nome.trim();
    this.dataNascimento = nascimento.toISOString().slice(0, 10);
    this.responsavel = responsavel ? String(responsavel).trim() : undefined;
    this.telefone = telefone;
    this.email = email;

    if (this.getIdade() < 18 && !this.responsavel) {
      throw new Error('Responsavel e obrigatorio para alunos menores de idade.');
    }
  }

  getIdade(hoje = new Date()) {
    const n = new Date(this.dataNascimento);
    let idade = hoje.getUTCFullYear() - n.getUTCFullYear();
    const fezAniversario =
      hoje.getUTCMonth() > n.getUTCMonth() ||
      (hoje.getUTCMonth() === n.getUTCMonth() && hoje.getUTCDate() >= n.getUTCDate());
    if (!fezAniversario) idade -= 1;
    return idade;
  }
}

module.exports = Aluno;
