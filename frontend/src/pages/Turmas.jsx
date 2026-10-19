import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({ nome: '', categoria: '', local: '', vagas: 20 });
  const [sel, setSel] = useState({});
  const [erro, setErro] = useState('');

  const carregar = async () => {
    try {
      setTurmas(await api.listarTurmas());
      setAlunos(await api.listarAlunos());
    } catch (e) { setErro(e.message); }
  };
  useEffect(() => { carregar(); }, []);

  const criar = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await api.criarTurma({ ...form, vagas: Number(form.vagas) });
      carregar();
    } catch (err) { setErro(err.message); }
  };
  const matricular = async (turmaId) => {
    setErro('');
    try {
      await api.matricular(turmaId, sel[turmaId]);
      carregar();
    } catch (err) { setErro(err.message); }
  };
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  return (
    <section>
      <h2>Cadastrar turma</h2>
      <form onSubmit={criar}>
        <input placeholder="Nome" value={form.nome} onChange={set('nome')} />
        <input placeholder="Categoria" value={form.categoria} onChange={set('categoria')} />
        <input placeholder="Local" value={form.local} onChange={set('local')} />
        <input type="number" min="1" value={form.vagas} onChange={set('vagas')} />
        <button type="submit">Criar</button>
      </form>
      {erro && <p className="erro">{erro}</p>}
      {turmas.map((t) => (
        <div className="card" key={t.id}>
          <strong>{t.nome}</strong> ({t.categoria}) — {t.vagasOcupadas}/{t.vagas} vagas
          <ul>{t.alunos.map((a) => <li key={a.id}>{a.nome}</li>)}</ul>
          <select value={sel[t.id] || ''} onChange={(e) => setSel({ ...sel, [t.id]: e.target.value })}>
            <option value="">Selecione um aluno</option>
            {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          <button disabled={!sel[t.id]} onClick={() => matricular(t.id)}>Matricular</button>
        </div>
      ))}
    </section>
  );
}
