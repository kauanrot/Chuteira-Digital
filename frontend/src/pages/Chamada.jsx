import { useEffect, useState } from 'react';
import { api } from '../api.js';

const hoje = () => new Date().toISOString().slice(0, 10);

export default function Chamada() {
  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState('');
  const [data, setData] = useState(hoje());
  const [presentes, setPresentes] = useState({});
  const [historico, setHistorico] = useState([]);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => { api.listarTurmas().then(setTurmas).catch((e) => setErro(e.message)); }, []);

  const turma = turmas.find((t) => t.id === turmaId);
  const escolher = async (id) => {
    setTurmaId(id);
    setPresentes({});
    setHistorico(id ? await api.listarChamadas(id) : []);
  };
  const salvar = async () => {
    setErro(''); setMsg('');
    try {
      const registros = turma.alunos.map((a) => ({ alunoId: a.id, presente: !!presentes[a.id] }));
      await api.registrarChamada(turmaId, { data, registros });
      setMsg('Chamada registrada!');
      setHistorico(await api.listarChamadas(turmaId));
    } catch (err) { setErro(err.message); }
  };

  return (
    <section>
      <h2>Registrar chamada</h2>
      <select value={turmaId} onChange={(e) => escolher(e.target.value)}>
        <option value="">Selecione a turma</option>
        {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
      </select>
      <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      {turma && (
        <>
          <ul className="lista">
            {turma.alunos.map((a) => (
              <li key={a.id}>
                <label>
                  <input type="checkbox" checked={!!presentes[a.id]}
                    onChange={(e) => setPresentes({ ...presentes, [a.id]: e.target.checked })} />
                  {a.nome}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={salvar} disabled={turma.alunos.length === 0}>Salvar chamada</button>
          <h3>Histórico</h3>
          <ul>
            {historico.map((c) => (
              <li key={c.id}>{c.data}: {c.registros.filter((r) => r.presente).length}/{c.registros.length} presentes</li>
            ))}
          </ul>
        </>
      )}
      {msg && <p className="ok">{msg}</p>}
      {erro && <p className="erro">{erro}</p>}
    </section>
  );
}
