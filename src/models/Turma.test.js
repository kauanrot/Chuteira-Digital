const Turma = require('./Turma');

describe('Turma - construtor', () => {
  test('deve criar uma turma valida com os dados informados', () => {
    const turma = new Turma({ id: 1, nome: 'Sub-9 Manha', categoria: 'Sub-9', local: 'Campo 1', vagas: 20 });

    expect(turma.nome).toBe('Sub-9 Manha');
    expect(turma.vagas).toBe(20);
    expect(turma.listarAlunos()).toHaveLength(0);
  });

  test('deve lancar erro ao criar turma sem nome', () => {
    expect(() => new Turma({ id: 2, nome: '', categoria: 'Sub-11', local: 'Campo 2', vagas: 15 }))
      .toThrow('Nome da turma e obrigatorio.');
  });

  test('deve lancar erro ao criar turma com numero de vagas invalido', () => {
    expect(() => new Turma({ id: 3, nome: 'Sub-13', categoria: 'Sub-13', local: 'Campo 3', vagas: 0 }))
      .toThrow('Numero de vagas deve ser um inteiro maior que zero.');
    expect(() => new Turma({ id: 4, nome: 'Sub-13 Noite', categoria: 'Sub-13', local: 'Campo 3', vagas: -5 }))
      .toThrow('Numero de vagas deve ser um inteiro maior que zero.');
  });
});

describe('Turma - verificarVagaDisponivel', () => {
  test('deve retornar true quando a turma ainda tem vagas disponiveis', () => {
    const turma = new Turma({ id: 5, nome: 'Sub-9 Tarde', categoria: 'Sub-9', local: 'Campo 1', vagas: 2 });

    expect(turma.verificarVagaDisponivel()).toBe(true);
  });

  test('deve retornar false quando a turma esta lotada', () => {
    const turma = new Turma({ id: 6, nome: 'Sub-9 Noite', categoria: 'Sub-9', local: 'Campo 1', vagas: 1 });
    turma.matricularAluno({ id: 100, nome: 'Joao Silva' });

    expect(turma.verificarVagaDisponivel()).toBe(false);
  });
});

describe('Turma - matricularAluno', () => {
  test('deve matricular um aluno com sucesso quando ha vaga disponivel', () => {
    const turma = new Turma({ id: 7, nome: 'Sub-11 Manha', categoria: 'Sub-11', local: 'Campo 2', vagas: 3 });

    const resultado = turma.matricularAluno({ id: 101, nome: 'Maria Souza' });

    expect(resultado).toBe(true);
    expect(turma.getVagasOcupadas()).toBe(1);
  });

  test('deve lancar erro ao matricular aluno quando a turma esta lotada', () => {
    const turma = new Turma({ id: 8, nome: 'Sub-11 Tarde', categoria: 'Sub-11', local: 'Campo 2', vagas: 1 });
    turma.matricularAluno({ id: 102, nome: 'Pedro Lima' });

    expect(() => turma.matricularAluno({ id: 103, nome: 'Ana Costa' }))
      .toThrow('esta lotada, nao ha vagas disponiveis.');
  });

  test('deve lancar erro ao matricular o mesmo aluno duas vezes na mesma turma', () => {
    const turma = new Turma({ id: 9, nome: 'Sub-13 Manha', categoria: 'Sub-13', local: 'Campo 3', vagas: 5 });
    turma.matricularAluno({ id: 104, nome: 'Carlos Andrade' });

    expect(() => turma.matricularAluno({ id: 104, nome: 'Carlos Andrade' }))
      .toThrow('ja esta matriculado nesta turma.');
  });
});

describe('Turma - removerAluno', () => {
  test('deve remover um aluno matriculado com sucesso', () => {
    const turma = new Turma({ id: 10, nome: 'Sub-13 Tarde', categoria: 'Sub-13', local: 'Campo 3', vagas: 5 });
    turma.matricularAluno({ id: 105, nome: 'Bruna Alves' });

    const resultado = turma.removerAluno(105);

    expect(resultado).toBe(true);
    expect(turma.getVagasOcupadas()).toBe(0);
  });

  test('deve retornar false ao tentar remover um aluno que nao esta matriculado', () => {
    const turma = new Turma({ id: 11, nome: 'Sub-15 Manha', categoria: 'Sub-15', local: 'Campo 4', vagas: 5 });

    const resultado = turma.removerAluno(999);

    expect(resultado).toBe(false);
  });
});

describe('Turma - getVagasDisponiveis', () => {
  test('deve calcular corretamente as vagas disponiveis apos matriculas', () => {
    const turma = new Turma({ id: 12, nome: 'Sub-15 Tarde', categoria: 'Sub-15', local: 'Campo 4', vagas: 10 });
    turma.matricularAluno({ id: 106, nome: 'Lucas Pereira' });
    turma.matricularAluno({ id: 107, nome: 'Rafael Gomes' });

    expect(turma.getVagasDisponiveis()).toBe(8);
  });

  test('deve retornar zero vagas disponiveis quando a turma esta cheia', () => {
    const turma = new Turma({ id: 13, nome: 'Sub-17 Manha', categoria: 'Sub-17', local: 'Campo 5', vagas: 2 });
    turma.matricularAluno({ id: 108, nome: 'Igor Martins' });
    turma.matricularAluno({ id: 109, nome: 'Felipe Rocha' });

    expect(turma.getVagasDisponiveis()).toBe(0);
  });
});
