import { useEffect, useState } from 'react';
import { api } from '../api.js';

const VAZIO = { nome: '', dataNascimento: '', responsavel: '', telefone: '', email: '' };

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');

  const carregar = () => api.listarAlunos().then(setAlunos).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await api.criarAluno(form);
      setForm(VAZIO);
      carregar();
    } catch (err) { setErro(err.message); }
  };
  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  return (
    <section>
      <h2>Cadastrar aluno</h2>
      <form onSubmit={salvar}>
        <input placeholder="Nome" value={form.nome} onChange={set('nome')} />
        <input type="date" value={form.dataNascimento} onChange={set('dataNascimento')} />
        <input placeholder="Responsável" value={form.responsavel} onChange={set('responsavel')} />
        <input placeholder="Telefone" value={form.telefone} onChange={set('telefone')} />
        <input placeholder="E-mail" value={form.email} onChange={set('email')} />
        <button type="submit">Salvar</button>
      </form>
      {erro && <p className="erro">{erro}</p>}
      <table>
        <thead><tr><th>Nome</th><th>Nascimento</th><th>Responsável</th></tr></thead>
        <tbody>
          {alunos.map((a) => (
            <tr key={a.id}><td>{a.nome}</td><td>{a.dataNascimento}</td><td>{a.responsavel || '-'}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
