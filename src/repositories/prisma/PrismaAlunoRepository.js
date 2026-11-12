const Aluno = require('../../models/Aluno');
const { paraIdBanco, paraIdDominio, paraDataBanco, paraDataDominio, ouUndefined } = require('./ids');

function paraDominio(row) {
  return new Aluno({
    id: paraIdDominio(row.id),
    nome: row.nome,
    dataNascimento: paraDataDominio(row.dataNascimento),
    responsavel: ouUndefined(row.responsavel),
    telefone: ouUndefined(row.telefone),
    email: ouUndefined(row.email),
    responsavelUsuarioId: row.responsavelUsuarioId ? paraIdDominio(row.responsavelUsuarioId) : undefined,
  });
}

function paraBanco(aluno) {
  return {
    nome: aluno.nome,
    dataNascimento: paraDataBanco(aluno.dataNascimento),
    responsavel: aluno.responsavel ?? null,
    telefone: aluno.telefone ?? null,
    email: aluno.email ?? null,
    responsavelUsuarioId: paraIdBanco(aluno.responsavelUsuarioId),
  };
}

/** Repositorio de alunos no PostgreSQL (tabela Aluno). */
class PrismaAlunoRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async salvar(aluno) {
    const id = paraIdBanco(aluno.id);
    const row = id
      ? await this.prisma.aluno.update({ where: { id }, data: paraBanco(aluno) })
      : await this.prisma.aluno.create({ data: paraBanco(aluno) });
    aluno.id = paraIdDominio(row.id);
    return aluno;
  }
  async buscarPorId(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return null;
    const row = await this.prisma.aluno.findUnique({ where: { id: idBanco } });
    return row ? paraDominio(row) : null;
  }
  async listar() {
    const rows = await this.prisma.aluno.findMany({ orderBy: { id: 'asc' } });
    return rows.map(paraDominio);
  }
  async remover(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return false;
    const { count } = await this.prisma.aluno.deleteMany({ where: { id: idBanco } });
    return count > 0;
  }
}

PrismaAlunoRepository.paraDominio = paraDominio;
module.exports = PrismaAlunoRepository;
