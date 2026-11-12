const PERFIS = ['ADMIN', 'PROFESSOR', 'RESPONSAVEL'];

/**
 * Usuario - conta de acesso ao sistema.
 * Guarda apenas o hash da senha (bcrypt); o hash nunca sai na API (ver toJSON).
 */
class Usuario {
  constructor({ id, nome, email, senhaHash, perfil, criadoEm }) {
    if (typeof nome !== 'string' || nome.trim() === '') {
      throw new Error('Nome do usuario e obrigatorio.');
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('E-mail invalido.');
    }
    if (!PERFIS.includes(perfil)) {
      throw new Error(`Perfil invalido. Use: ${PERFIS.join(', ')}.`);
    }
    if (typeof senhaHash !== 'string' || senhaHash === '') {
      throw new Error('Senha do usuario e obrigatoria.');
    }
    this.id = id;
    this.nome = nome.trim();
    this.email = email.trim().toLowerCase();
    this.senhaHash = senhaHash;
    this.perfil = perfil;
    this.criadoEm = criadoEm;
  }

  toJSON() {
    return { id: this.id, nome: this.nome, email: this.email, perfil: this.perfil };
  }
}

Usuario.PERFIS = PERFIS;
module.exports = Usuario;
