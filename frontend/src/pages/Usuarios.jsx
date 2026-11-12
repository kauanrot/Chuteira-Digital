import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../api.js';
import Gaveta from '../components/Gaveta.jsx';
import { IconeMais } from '../components/Icones.jsx';
import { iniciais, plural, ROTULO_PERFIL } from '../util.js';

const VAZIO = { nome: '', email: '', senha: '', perfil: 'PROFESSOR' };
const EXPLICA = {
  ADMIN: 'Acesso total: alunos, turmas, chamadas e usuários.',
  PROFESSOR: 'Vê e faz a chamada só das turmas em que é o professor.',
  RESPONSAVEL: 'Vê só a turma e a frequência dos próprios alunos.',
};
const ETIQUETA = { ADMIN: 'neutra', PROFESSOR: 'ok', RESPONSAVEL: 'warn' };

export default function Usuarios({ dados, usuario }) {
  const { usuarios, turmas, alunos, carregando, erro, recarregar } = dados;
  const [aberta, setAberta] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  };

  // O que a conta alcança hoje: turmas do professor ou alunos do responsável.
  const vinculo = (u) => {
    if (u.perfil === 'PROFESSOR') {
      const n = turmas.filter((t) => t.professorId === u.id).length;
      return n ? plural(n, 'turma', 'turmas') : 'Nenhuma turma ainda';
    }
    if (u.perfil === 'RESPONSAVEL') {
      const meus = alunos.filter((a) => a.responsavelUsuarioId === u.id);
      return meus.length ? meus.map((a) => a.nome.split(' ')[0]).join(', ') : 'Nenhum aluno ligado';
    }
    return 'Toda a escola';
  };

  const salvar = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.nome.trim()) v.nome = 'Informe o nome.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) v.email = 'Informe um e-mail válido.';
    if (form.senha.length < 8) v.senha = 'Use pelo menos 8 caracteres.';
    setErros(v);
    if (Object.keys(v).length) return;
    setSalvando(true);
    try {
      const novo = await api.criarUsuario({ ...form, nome: form.nome.trim(), email: form.email.trim() });
      toast.success(`Conta de ${novo.nome} criada`, { description: `Perfil: ${ROTULO_PERFIL[novo.perfil]}` });
      setAberta(false);
      recarregar();
    } catch (err) {
      if (err.status === 409) setErros({ email: err.message });
      else toast.error('Não foi possível criar a conta', { description: err.message });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pagina">
      <div className="barra">
        <p className="muted">{carregando ? 'Carregando…' : `${plural(usuarios.length, 'conta', 'contas')} com acesso ao sistema`}</p>
        <span className="espaco" />
        <button className="btn btn-primario" onClick={() => { setForm(VAZIO); setErros({}); setAberta(true); }}>
          <IconeMais />Novo usuário
        </button>
      </div>

      {erro && (
        <div className="erro-carga" role="alert">
          <span>{erro}</span>
          <button className="btn btn-secundario btn-sm" onClick={recarregar}>Tentar de novo</button>
        </div>
      )}

      <div className="painel tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr><th>Pessoa</th><th>Perfil</th><th className="esconde-mobile">Alcance</th></tr>
          </thead>
          <tbody>
            {carregando && Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} aria-hidden="true">
                <td><div className="pessoa"><span className="avatar" /><span className="esqueleto" style={{ width: 180 }} /></div></td>
                <td><span className="esqueleto" style={{ width: 90 }} /></td>
                <td className="esconde-mobile"><span className="esqueleto" style={{ width: 120 }} /></td>
              </tr>
            ))}
            {!carregando && usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="pessoa">
                    <span className="avatar">{iniciais(u.nome)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="pessoa-nome trunca">{u.nome}{u.id === usuario.id && <span className="muted"> (você)</span>}</div>
                      <div className="pessoa-sub trunca">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`etiqueta ${ETIQUETA[u.perfil]}`}>{ROTULO_PERFIL[u.perfil]}</span></td>
                <td className="esconde-mobile muted">{vinculo(u)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Gaveta
        aberta={aberta}
        aoFechar={() => !salvando && setAberta(false)}
        titulo="Novo usuário"
        descricao="A pessoa entra com o e-mail e a senha definidos aqui."
        onSubmit={salvar}
        rodape={(
          <>
            <button type="button" className="btn btn-fantasma" onClick={() => setAberta(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primario" disabled={salvando}>{salvando ? 'Salvando…' : 'Criar conta'}</button>
          </>
        )}
      >
        <div className="campo">
          <label htmlFor="u-nome">Nome</label>
          <input id="u-nome" className="entrada" value={form.nome} onChange={set('nome')} aria-invalid={!!erros.nome} autoComplete="off" />
          {erros.nome && <span className="dica erro">{erros.nome}</span>}
        </div>
        <div className="campo">
          <label htmlFor="u-email">E-mail</label>
          <input id="u-email" className="entrada" type="email" value={form.email} onChange={set('email')}
            aria-invalid={!!erros.email} autoComplete="off" placeholder="nome@escola.com" />
          {erros.email && <span className="dica erro">{erros.email}</span>}
        </div>
        <div className="campo">
          <label htmlFor="u-senha">Senha inicial</label>
          <input id="u-senha" className="entrada" type="text" value={form.senha} onChange={set('senha')}
            aria-invalid={!!erros.senha} autoComplete="new-password" />
          <span className={`dica ${erros.senha ? 'erro' : ''}`}>{erros.senha || 'Pelo menos 8 caracteres. Passe a senha para a pessoa.'}</span>
        </div>
        <div className="campo">
          <label htmlFor="u-perfil">Perfil</label>
          <select id="u-perfil" className="entrada" value={form.perfil} onChange={set('perfil')}>
            {Object.keys(EXPLICA).map((p) => <option key={p} value={p}>{ROTULO_PERFIL[p]}</option>)}
          </select>
          <span className="dica">{EXPLICA[form.perfil]}</span>
        </div>
      </Gaveta>
    </div>
  );
}
