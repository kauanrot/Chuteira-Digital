const { Prisma } = require('@prisma/client');
const Chamada = require('../../models/Chamada');
const { ConflictError } = require('../../errors');
const { paraIdBanco, paraIdDominio, paraDataBanco, paraDataDominio } = require('./ids');

const incluirPresencas = { presencas: { orderBy: { alunoId: 'asc' } } };

function paraDominio(row) {
  return new Chamada({
    id: paraIdDominio(row.id),
    turmaId: paraIdDominio(row.turmaId),
    data: paraDataDominio(row.data),
    registros: row.presencas.map((p) => ({ alunoId: paraIdDominio(p.alunoId), presente: p.presente })),
  });
}

/** Repositorio de chamadas no PostgreSQL (tabelas Chamada + Presenca). */
class PrismaChamadaRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async salvar(chamada) {
    const presencas = chamada.registros.map((r) => ({ alunoId: paraIdBanco(r.alunoId), presente: r.presente }));
    const existente = paraIdBanco(chamada.id);
    try {
      const row = existente
        ? await this.prisma.$transaction(async (tx) => {
          await tx.presenca.deleteMany({ where: { chamadaId: existente } });
          return tx.chamada.update({
            where: { id: existente },
            data: { data: paraDataBanco(chamada.data), presencas: { create: presencas } },
          });
        })
        : await this.prisma.chamada.create({
          data: {
            turmaId: paraIdBanco(chamada.turmaId),
            data: paraDataBanco(chamada.data),
            presencas: { create: presencas },
          },
        });
      chamada.id = paraIdDominio(row.id);
      return chamada;
    } catch (e) {
      // @@unique([turmaId, data]) protege contra chamadas duplicadas concorrentes.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictError('Ja existe chamada para esta turma nesta data.');
      }
      throw e;
    }
  }
  async buscarPorId(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return null;
    const row = await this.prisma.chamada.findUnique({ where: { id: idBanco }, include: incluirPresencas });
    return row ? paraDominio(row) : null;
  }
  async listar() {
    const rows = await this.prisma.chamada.findMany({ orderBy: { id: 'asc' }, include: incluirPresencas });
    return rows.map(paraDominio);
  }
  async listarPorTurma(turmaId) {
    const idBanco = paraIdBanco(turmaId);
    if (!idBanco) return [];
    const rows = await this.prisma.chamada.findMany({
      where: { turmaId: idBanco },
      orderBy: { data: 'asc' },
      include: incluirPresencas,
    });
    return rows.map(paraDominio);
  }
  async remover(id) {
    const idBanco = paraIdBanco(id);
    if (!idBanco) return false;
    return this.prisma.$transaction(async (tx) => {
      await tx.presenca.deleteMany({ where: { chamadaId: idBanco } });
      const { count } = await tx.chamada.deleteMany({ where: { id: idBanco } });
      return count > 0;
    });
  }
}

module.exports = PrismaChamadaRepository;
