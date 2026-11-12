const { Prisma } = require('@prisma/client');
const Usuario = require('../../models/Usuario');
const { ConflictError } = require('../../errors');
const { paraIdBanco, paraIdDominio } = require('./ids');

function paraDominio(row) {
  return new Usuario({
    id: paraIdDominio(row.id),
    nome: row.nome,
    email: row.email,
    senhaHash: row.senhaHash,
    perfil: row.perfil,
    criadoEm: row.criadoEm,
  });
}

/** Repositorio de usuarios no PostgreSQL (tabela Usuario). */
class PrismaUsuarioRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async salvar(usuario) {
    const dados = { nome: usuario.nome, email: usuario.email, senhaHash: usuario.senhaHash, perfil: usuario.perfil };
    const id = paraIdBanco(usuario.id);
    try {
      const row = id
        ? await this.prisma.usuario.update({ where: { id }, data: dados })
        : await this.prisma.usuario.create({ data: dados });
      usuario.id = paraIdDominio(row.id);
      return usuario;
    } catch (e) {
      // email @unique protege contra cadastros concorrentes com o mesmo e-mail.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictError('Ja existe um usuario com este e-mail.');
      }
      throw e;
    }
  }
  async buscarPorId(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return null;
    const row = await this.prisma.usuario.findUnique({ where: { id: idBanco } });
    return row ? paraDominio(row) : null;
  }
  async buscarPorEmail(email) {
    const alvo = String(email || '').trim().toLowerCase();
    if (!alvo) return null;
    const row = await this.prisma.usuario.findUnique({ where: { email: alvo } });
    return row ? paraDominio(row) : null;
  }
  async listar() {
    const rows = await this.prisma.usuario.findMany({ orderBy: { id: 'asc' } });
    return rows.map(paraDominio);
  }
  async contar() {
    return this.prisma.usuario.count();
  }
  async remover(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return false;
    const { count } = await this.prisma.usuario.deleteMany({ where: { id: idBanco } });
    return count > 0;
  }
}

module.exports = PrismaUsuarioRepository;
