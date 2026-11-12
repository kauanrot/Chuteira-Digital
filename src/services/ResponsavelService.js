/** Visao do responsavel: os alunos ligados a conta dele, com turmas e presencas. */
class ResponsavelService {
  constructor(alunoRepo, turmaRepo, chamadaRepo) {
    this.alunoRepo = alunoRepo;
    this.turmaRepo = turmaRepo;
    this.chamadaRepo = chamadaRepo;
  }

  async resumo(usuarioId) {
    const id = String(usuarioId);
    const alunos = (await this.alunoRepo.listar()).filter((a) => a.responsavelUsuarioId === id);
    if (alunos.length === 0) return [];

    const turmas = await this.turmaRepo.listar();
    const chamadasPorTurma = new Map();
    const chamadasDa = async (turmaId) => {
      if (!chamadasPorTurma.has(turmaId)) {
        chamadasPorTurma.set(turmaId, await this.chamadaRepo.listarPorTurma(turmaId));
      }
      return chamadasPorTurma.get(turmaId);
    };

    const resultado = [];
    for (const aluno of alunos) {
      const doAluno = turmas.filter((t) => t.listarAlunos().some((a) => a.id === aluno.id));
      const presencas = [];
      for (const turma of doAluno) {
        for (const chamada of await chamadasDa(turma.id)) {
          const registro = chamada.registros.find((r) => r.alunoId === aluno.id);
          if (registro) presencas.push({ turmaId: turma.id, data: chamada.data, presente: registro.presente });
        }
      }
      presencas.sort((x, y) => x.data.localeCompare(y.data));
      resultado.push({
        aluno,
        turmas: doAluno.map((t) => ({ id: t.id, nome: t.nome, categoria: t.categoria, local: t.local })),
        presencas,
      });
    }
    return resultado;
  }
}

module.exports = ResponsavelService;
