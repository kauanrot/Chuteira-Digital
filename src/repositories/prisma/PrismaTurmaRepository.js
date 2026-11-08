const Turma = require('../../models/Turma');
const PrismaAlunoRepository = require('./PrismaAlunoRepository');
const { paraIdBanco, paraIdDominio, ouUndefined } = require('./ids');

const incluirAlunos = { matriculas: { include: { aluno: true }, orderBy: { alunoId: 'asc' } } };

function paraDominio(row) {
  const turma = new Turma({
    id: paraIdDominio(row.id),
    nome: row.nome,
    categoria: row.categoria,
    local: ouUndefined(row.local),
    vagas: row.vagas,
  });
  // Carrega as matriculas direto no estado da entidade (ja validadas quando gravadas).
  turma.alunosMatriculados = row.matriculas.map((m) => PrismaAlunoRepository.paraDominio(m.aluno));
  return turma;
}

/**
 * Repositorio de turmas no PostgreSQL. `salvar` grava os dados da turma e
 * sincroniza a tabela Matricula com `turma.alunosMatriculados`.
 */
class PrismaTurmaRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async salvar(turma) {
    const dados = { nome: turma.nome, categoria: turma.categoria, local: turma.local ?? null, vagas: turma.vagas };
    const alunoIds = turma.listarAlunos().map((a) => paraIdBanco(a.id));

    const id = await this.prisma.$transaction(async (tx) => {
      const existente = paraIdBanco(turma.id);
      const row = existente
        ? await tx.turma.update({ where: { id: existente }, data: dados })
        : await tx.turma.create({ data: dados });
      await tx.matricula.deleteMany({ where: { turmaId: row.id, alunoId: { notIn: alunoIds } } });
      if (alunoIds.length) {
        await tx.matricula.createMany({
          data: alunoIds.map((alunoId) => ({ turmaId: row.id, alunoId })),
          skipDuplicates: true,
        });
      }
      return row.id;
    });

    turma.id = paraIdDominio(id);
    return turma;
  }
  async buscarPorId(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return null;
    const row = await this.prisma.turma.findUnique({ where: { id: idBanco }, include: incluirAlunos });
    return row ? paraDominio(row) : null;
  }
  async listar() {
    const rows = await this.prisma.turma.findMany({ orderBy: { id: 'asc' }, include: incluirAlunos });
    return rows.map(paraDominio);
  }
  async remover(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return false;
    return this.prisma.$transaction(async (tx) => {
      await tx.matricula.deleteMany({ where: { turmaId: idBanco } });
      const { count } = await tx.turma.deleteMany({ where: { id: idBanco } });
      return count > 0;
    });
  }
}

module.exports = PrismaTurmaRepository;
