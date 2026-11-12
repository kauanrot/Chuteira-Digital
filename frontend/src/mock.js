import { lerToken } from './sessao.js';

// Dados de exemplo para o protótipo visual (npm run dev:mock).
// Implementa o mesmo contrato de api.js, em memória, sem chamar o back-end.
// Todos os nomes e números são fictícios.

const NOMES = [
  ['Arthur Pereira Lima', '2017-03-14', 'Juliana Pereira', '(11) 98421-3307'],
  ['Bernardo Alves Rocha', '2015-08-02', 'Marcos Rocha', '(11) 99104-5521'],
  ['Davi Lima Santos', '2013-01-21', 'Cristina Lima', '(11) 97452-1180'],
  ['Enzo Gabriel Souza', '2017-05-30', 'Patrícia Souza', '(11) 97733-0418'],
  ['Gael Martins Costa', '2011-11-11', 'Roberto Costa', '(11) 98002-6619'],
  ['Helena Castro Ribeiro', '2013-09-07', 'Ana Castro', '(11) 96541-2290'],
  ['Heitor Costa Nunes', '2015-04-19', 'Fernanda Nunes', '(11) 99876-1043'],
  ['Isaac Barbosa Teixeira', '2013-02-25', 'Cláudio Teixeira', '(11) 98215-7730'],
  ['Laura Fernandes Dias', '2013-06-13', 'Simone Dias', '(11) 97120-4486'],
  ['Lorenzo Carvalho Gomes', '2011-12-03', 'Diego Gomes', '(11) 99340-8812'],
  ['Miguel Santos Oliveira', '2017-10-28', 'Renata Oliveira', '(11) 98654-2201'],
  ['Pedro Henrique Dias', '2015-07-16', 'Sérgio Dias', '(11) 99012-7745'],
  ['Samuel Ribeiro Araújo', '2013-03-09', 'Luciana Araújo', '(11) 96217-5534'],
  ['Théo Rocha Mendes', '2017-01-05', 'Paulo Mendes', '(11) 99781-3365'],
  ['Valentina Rocha Prado', '2013-10-22', 'Débora Prado', '(11) 98870-1129'],
  ['Maria Clara Silva', '2014-04-03', 'Rogério Silva', '(11) 97004-6612'],
  ['Alice Monteiro Reis', '2013-12-17', 'Camila Monteiro', '(11) 99561-0384'],
  ['Matheus Gomes Freitas', '2011-05-26', 'André Freitas', '(11) 98123-9950'],
  ['Rafael Araújo Pinto', '2015-02-11', 'Tatiane Pinto', '(11) 97381-2276'],
  ['João Pedro Nunes', '2017-08-19', 'Vanessa Nunes', '(11) 96655-4013'],
  ['Gustavo Moreira Lopes', '2011-09-30', 'Fábio Lopes', '(11) 99230-7781'],
  ['Benício Teixeira Cruz', '2015-11-08', 'Aline Cruz', '(11) 98744-3302'],
  ['Nicolas Cardoso Vieira', '2013-07-01', 'Rodrigo Vieira', '(11) 97518-6640'],
  ['Felipe Mendes Barros', '2011-03-15', 'Márcia Barros', '(11) 99407-2215'],
  ['Lucas Ferreira Campos', '2017-06-24', 'Eduardo Campos', '(11) 98306-5579'],
  ['Sophia Almeida Neves', '2014-01-29', 'Karina Neves', '(11) 96903-8847'],
  ['Caio Ribeiro Duarte', '2015-09-12', 'Leandro Duarte', '(11) 97266-0193'],
  ['Yasmin Correia Faria', '2013-05-18', 'Priscila Faria', '(11) 99688-4420'],
];

const TURMAS = [
  { nome: 'Sub-9 Manhã', categoria: 'Sub-9', local: 'Campo 1 · ter e qui, 9h', vagas: 20 },
  { nome: 'Sub-11 Tarde', categoria: 'Sub-11', local: 'Campo 2 · seg e qua, 16h', vagas: 20 },
  { nome: 'Sub-13 Tarde', categoria: 'Sub-13', local: 'Campo 1 · ter e qui, 17h30', vagas: 4 },
  { nome: 'Sub-15 Noite', categoria: 'Sub-15', local: 'Campo 1 · seg e qua, 19h', vagas: 22 },
  { nome: 'Feminino Sub-13', categoria: 'Feminino', local: 'Campo 2 · sex, 16h', vagas: 16 },
];

// Gerador pseudoaleatório fixo, para os dados não mudarem a cada recarga.
let semente = 7;
const rand = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);

// Contas de exemplo, uma por perfil. A senha só vale neste modo de protótipo.
export const SENHA_EXEMPLO = 'exemplo123';
export const CONTAS_EXEMPLO = [
  { id: '1', nome: 'Secretaria', email: 'secretaria@exemplo.com', perfil: 'ADMIN' },
  { id: '2', nome: 'Carlos Menezes', email: 'carlos@exemplo.com', perfil: 'PROFESSOR' },
  { id: '3', nome: 'Juliana Pereira', email: 'juliana@exemplo.com', perfil: 'RESPONSAVEL' },
  { id: '4', nome: 'Beatriz Antunes', email: 'beatriz@exemplo.com', perfil: 'PROFESSOR' },
];

const db = {
  alunos: [], turmas: [], chamadas: [],
  usuarios: CONTAS_EXEMPLO.map((u) => ({ ...u })),
  seq: { aluno: 0, turma: 0, chamada: 0, usuario: CONTAS_EXEMPLO.length },
};

function idadeEm(nasc) {
  const n = new Date(nasc), h = new Date();
  let a = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--;
  return a;
}

function categoriaPorIdade(nasc, nome) {
  const meninas = ['Helena', 'Laura', 'Valentina', 'Maria', 'Alice', 'Sophia', 'Yasmin'];
  if (meninas.some((m) => nome.startsWith(m))) return 'Feminino';
  const i = idadeEm(nasc);
  if (i <= 9) return 'Sub-9';
  if (i <= 11) return 'Sub-11';
  if (i <= 13) return 'Sub-13';
  return 'Sub-15';
}

function semear() {
  NOMES.forEach(([nome, dataNascimento, responsavel, telefone]) => {
    const email = `${responsavel.split(' ')[0].toLowerCase()}@exemplo.com`
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
    db.alunos.push({ id: String(++db.seq.aluno), nome, dataNascimento, responsavel, telefone, email });
  });
  // Carlos (id 2) dá aula em três turmas; Beatriz (id 4) nas outras duas.
  TURMAS.forEach((t, i) => db.turmas.push({
    id: String(++db.seq.turma), ...t, professorId: i % 2 === 0 ? '2' : '4', alunoIds: [],
  }));
  // Juliana (id 3) é a responsável pelo Arthur.
  db.alunos[0].responsavelUsuarioId = '3';
  db.alunos.forEach((a) => {
    const cat = categoriaPorIdade(a.dataNascimento, a.nome);
    const t = db.turmas.find((x) => x.categoria === cat);
    if (t && t.alunoIds.length < t.vagas) t.alunoIds.push(a.id);
  });
  // Oito treinos por turma, um por semana, terminando na semana passada.
  db.turmas.forEach((t) => {
    for (let s = 8; s >= 1; s--) {
      const d = new Date();
      d.setDate(d.getDate() - s * 7);
      const fraco = (id) => ['7', '19'].includes(id); // dois alunos com frequência baixa
      db.chamadas.push({
        id: String(++db.seq.chamada),
        turmaId: t.id,
        data: d.toISOString().slice(0, 10),
        registros: t.alunoIds.map((alunoId) => ({
          alunoId,
          presente: rand() > (fraco(alunoId) ? 0.55 : 0.12),
        })),
      });
    }
  });
}
semear();

const espera = (v) => new Promise((ok) => setTimeout(() => ok(structuredClone(v)), 180));
const falha = (msg) => new Promise((_, nao) => setTimeout(() => nao(new Error(msg)), 180));

function resumo(t) {
  const alunos = t.alunoIds.map((id) => db.alunos.find((a) => a.id === id));
  return {
    id: t.id, nome: t.nome, categoria: t.categoria, local: t.local, vagas: t.vagas, professorId: t.professorId,
    vagasOcupadas: alunos.length, vagasDisponiveis: t.vagas - alunos.length, alunos,
  };
}

// No protótipo o "token" é só o id da conta de exemplo.
const logado = () => db.usuarios.find((u) => u.id === lerToken()) || null;
const proibido = () => falha('Seu perfil não tem permissão para esta ação.');

export const mockApi = {
  login: (email, senha) => {
    const u = db.usuarios.find((x) => x.email === String(email).trim().toLowerCase());
    if (!u || senha !== (u.senha || SENHA_EXEMPLO)) return falha('E-mail ou senha incorretos.');
    const { senha: _, ...publico } = u;
    return espera({ token: u.id, usuario: publico });
  },
  eu: () => {
    const u = logado();
    if (!u) return falha('Faça login para continuar.');
    const { senha: _, ...publico } = u;
    return espera(publico);
  },
  listarUsuarios: () => espera(db.usuarios.map(({ senha: _, ...u }) => u)),
  criarUsuario: (d) => {
    if (!d.nome?.trim()) return falha('Informe o nome do usuário.');
    if (!/^\S+@\S+\.\S+$/.test(d.email || '')) return falha('E-mail inválido.');
    if ((d.senha || '').length < 8) return falha('A senha precisa ter pelo menos 8 caracteres.');
    const email = d.email.trim().toLowerCase();
    if (db.usuarios.some((u) => u.email === email)) return falha('Já existe um usuário com este e-mail.');
    const novo = { id: String(++db.seq.usuario), nome: d.nome.trim(), email, perfil: d.perfil, senha: d.senha };
    db.usuarios.push(novo);
    const { senha: _, ...publico } = novo;
    return espera(publico);
  },
  definirProfessor: (turmaId, professorId) => {
    const t = db.turmas.find((x) => x.id === turmaId);
    if (!t) return falha('Turma não encontrada.');
    t.professorId = professorId || undefined;
    return espera(resumo(t));
  },
  meusAlunos: () => {
    const u = logado();
    const meus = db.alunos.filter((a) => a.responsavelUsuarioId === u?.id);
    return espera(meus.map((aluno) => {
      const turmas = db.turmas.filter((t) => t.alunoIds.includes(aluno.id));
      const presencas = db.chamadas
        .filter((c) => turmas.some((t) => t.id === c.turmaId))
        .map((c) => ({ turmaId: c.turmaId, data: c.data, presente: !!c.registros.find((r) => r.alunoId === aluno.id)?.presente }))
        .sort((x, y) => x.data.localeCompare(y.data));
      return { aluno, turmas: turmas.map(({ id, nome, categoria, local }) => ({ id, nome, categoria, local })), presencas };
    }));
  },
  listarAlunos: () => (logado()?.perfil === 'ADMIN' ? espera(db.alunos) : proibido()),
  criarAluno: (d) => {
    if (!d.nome?.trim()) return falha('Informe o nome do aluno.');
    if (!d.dataNascimento) return falha('Informe a data de nascimento.');
    if (new Date(d.dataNascimento) > new Date()) return falha('A data de nascimento não pode ser no futuro.');
    if (idadeEm(d.dataNascimento) < 18 && !d.responsavel?.trim())
      return falha('Alunos menores de 18 anos precisam de um responsável.');
    const novo = { id: String(++db.seq.aluno), ...d };
    db.alunos.push(novo);
    return espera(novo);
  },
  atualizarAluno: (id, d) => {
    const a = db.alunos.find((x) => x.id === id);
    if (!a) return falha('Aluno não encontrado.');
    if (!d.nome?.trim()) return falha('Informe o nome do aluno.');
    if (idadeEm(d.dataNascimento) < 18 && !d.responsavel?.trim())
      return falha('Alunos menores de 18 anos precisam de um responsável.');
    Object.entries(d).forEach(([k, v]) => { if (v === null) delete a[k]; else a[k] = v; });
    return espera(a);
  },
  listarTurmas: () => {
    const u = logado();
    const visiveis = u?.perfil === 'PROFESSOR' ? db.turmas.filter((t) => t.professorId === u.id) : db.turmas;
    return espera(visiveis.map(resumo));
  },
  criarTurma: (d) => {
    if (!d.nome?.trim() || !d.categoria?.trim()) return falha('Informe nome e categoria da turma.');
    if (!(d.vagas > 0)) return falha('A turma precisa de pelo menos uma vaga.');
    const t = { id: String(++db.seq.turma), ...d, professorId: d.professorId || undefined, alunoIds: [] };
    db.turmas.push(t);
    return espera(resumo(t));
  },
  matricular: (turmaId, alunoId) => {
    const t = db.turmas.find((x) => x.id === turmaId);
    if (!t) return falha('Turma não encontrada.');
    if (t.alunoIds.includes(alunoId)) return falha('Este aluno já está matriculado nesta turma.');
    if (t.alunoIds.length >= t.vagas) return falha('A turma está lotada.');
    t.alunoIds.push(alunoId);
    return espera(resumo(t));
  },
  registrarChamada: (turmaId, { data, registros }) => {
    if (db.chamadas.some((c) => c.turmaId === turmaId && c.data === data))
      return falha('Já existe uma chamada desta turma nesta data.');
    const c = { id: String(++db.seq.chamada), turmaId, data, registros };
    db.chamadas.push(c);
    return espera(c);
  },
  listarChamadas: (turmaId) => espera(db.chamadas.filter((c) => c.turmaId === turmaId)),
};
