const { paraIdBanco, paraDataBanco, paraDataDominio } = require('../src/repositories/prisma/ids');
const { criarRepositoriosMemoria } = require('../src/repositories');

describe('Conversao de ids/datas (Prisma)', () => {
  test('aceita ids numericos validos', () => {
    expect(paraIdBanco('42')).toBe(42);
    expect(paraIdBanco(7)).toBe(7);
  });
  test('rejeita ids invalidos ou fora do Int do PostgreSQL', () => {
    for (const id of ['abc', '', '0', '-1', '1.5', '2147483648', null, undefined]) {
      expect(paraIdBanco(id)).toBeNull();
    }
  });
  test('datas AAAA-MM-DD fazem ida e volta sem deslocar o dia', () => {
    expect(paraDataDominio(paraDataBanco('2026-10-10'))).toBe('2026-10-10');
  });
});

describe('Repositorios em memoria (contrato assincrono)', () => {
  test('salvar/buscarPorId/listar/remover', async () => {
    const { alunoRepo } = criarRepositoriosMemoria();
    const salvo = await alunoRepo.salvar({ nome: 'Joao' });
    expect(salvo.id).toBe('1');
    expect(await alunoRepo.buscarPorId(1)).toBe(salvo);
    expect(await alunoRepo.listar()).toHaveLength(1);
    expect(await alunoRepo.remover('1')).toBe(true);
    expect(await alunoRepo.buscarPorId('1')).toBeNull();
  });
  test('chamadas listadas por turma', async () => {
    const { chamadaRepo } = criarRepositoriosMemoria();
    await chamadaRepo.salvar({ turmaId: '1', data: '2026-10-10' });
    await chamadaRepo.salvar({ turmaId: '2', data: '2026-10-10' });
    expect(await chamadaRepo.listarPorTurma(1)).toHaveLength(1);
  });
});
