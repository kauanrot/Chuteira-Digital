/**
 * Chamada (RF05) - registro de presenca de uma turma em uma data.
 * registros: [{ alunoId, presente }]
 */
class Chamada {
  constructor({ id, turmaId, data, registros }) {
    if (!turmaId) throw new Error('Turma da chamada e obrigatoria.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '') || Number.isNaN(new Date(data).getTime())) {
      throw new Error('Data da chamada deve estar no formato AAAA-MM-DD.');
    }
    if (!Array.isArray(registros)) throw new Error('Registros de presenca sao obrigatorios.');
    const ids = registros.map((r) => r.alunoId);
    if (new Set(ids).size !== ids.length) {
      throw new Error('Aluno repetido na mesma chamada.');
    }
    for (const r of registros) {
      if (!r.alunoId || typeof r.presente !== 'boolean') {
        throw new Error('Cada registro deve ter alunoId e presente (booleano).');
      }
    }
    this.id = id;
    this.turmaId = turmaId;
    this.data = data;
    this.registros = registros.map((r) => ({ alunoId: r.alunoId, presente: r.presente }));
  }

  totalPresentes() {
    return this.registros.filter((r) => r.presente).length;
  }

  totalAusentes() {
    return this.registros.length - this.totalPresentes();
  }
}

module.exports = Chamada;
