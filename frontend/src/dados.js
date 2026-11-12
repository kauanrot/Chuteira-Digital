import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

// Carrega o que o perfil logado pode ver e deriva o que as telas precisam:
// a turma de cada aluno e a faixa dos últimos treinos.
// - ADMIN: alunos, turmas, chamadas e usuários.
// - PROFESSOR: só as turmas dele (a API já filtra); os alunos vêm das turmas.
// - RESPONSAVEL: nada aqui; a tela dele busca os próprios alunos.
export function useDados(usuario) {
  const perfil = usuario?.perfil;
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [chamadas, setChamadas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(perfil !== 'RESPONSAVEL');
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    if (perfil === 'RESPONSAVEL') return;
    setErro('');
    try {
      const admin = perfil === 'ADMIN';
      const [t, a, u] = await Promise.all([
        api.listarTurmas(),
        admin ? api.listarAlunos() : null,
        admin ? api.listarUsuarios() : [],
      ]);
      const c = (await Promise.all(t.map((x) => api.listarChamadas(x.id).catch(() => [])))).flat();
      const dasTurmas = [...new Map(t.flatMap((x) => x.alunos).map((x) => [x.id, x])).values()];
      setTurmas(t);
      setAlunos(a || dasTurmas);
      setUsuarios(u);
      setChamadas(c);
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar os dados.');
    } finally {
      setCarregando(false);
    }
  }, [perfil]);

  useEffect(() => { recarregar(); }, [recarregar]);

  const turmaDoAluno = useMemo(() => {
    const m = new Map();
    turmas.forEach((t) => t.alunos.forEach((a) => { if (!m.has(a.id)) m.set(a.id, t); }));
    return m;
  }, [turmas]);

  // Para cada aluno: lista dos últimos 8 treinos (true/false) do mais antigo ao mais novo.
  const frequencia = useMemo(() => {
    const ordenadas = [...chamadas].sort((x, y) => x.data.localeCompare(y.data));
    const m = new Map();
    ordenadas.forEach((c) => (c.registros || []).forEach((r) => {
      const id = String(r.alunoId);
      if (!m.has(id)) m.set(id, []);
      m.get(id).push(!!r.presente);
    }));
    m.forEach((v, k) => m.set(k, v.slice(-8)));
    return m;
  }, [chamadas]);

  return { alunos, turmas, chamadas, usuarios, carregando, erro, recarregar, turmaDoAluno, frequencia };
}
