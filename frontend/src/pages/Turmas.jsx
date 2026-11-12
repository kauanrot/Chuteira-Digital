import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../api.js';
import Gaveta from '../components/Gaveta.jsx';
import { IconeBusca, IconeMais } from '../components/Icones.jsx';
import { corCategoria, iniciais, idade, normalizar, plural } from '../util.js';

const CATEGORIAS = ['Sub-7', 'Sub-9', 'Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Feminino'];
const VAZIO = { nome: '', categoria: 'Sub-9', local: '', vagas: '20', professorId: '' };

function Vagas({ t }) {
  const ocupacao = t.vagas ? Math.min(1, t.vagasOcupadas / t.vagas) : 0;
  const cheia = t.vagasDisponiveis <= 0;
  return (
    <div className="vagas">
      <div className="vagas-txt">
        <span className="num">{t.vagasOcupadas} / {t.vagas}</span>
        {cheia && <span style={{ color: 'var(--bad)' }}>Lotada</span>}
      </div>
      <div className={`vagas-barra ${cheia ? 'cheia' : ''}`} role="presentation">
        <i style={{ transform: `scaleX(${ocupacao})` }} />
      </div>
    </div>
  );
}

// ADMIN gerencia tudo; PROFESSOR vê as próprias turmas, sem editar.
export default function Turmas({ dados, usuario }) {
  const { turmas, alunos, usuarios, carregando, erro, recarregar } = dados;
  const admin = usuario.perfil === 'ADMIN';
  const professores = usuarios.filter((u) => u.perfil === 'PROFESSOR');
  const [busca, setBusca] = useState('');
  const [selId, setSelId] = useState(() => turmas[0]?.id ?? null);
  const [alunoId, setAlunoId] = useState('');
  const [matriculando, setMatriculando] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!selId && turmas.length) setSelId(turmas[0].id);
  }, [turmas, selId]);
  useEffect(() => { setAlunoId(''); }, [selId]);

  const nomeProfessor = (t) => {
    if (!t.professorId) return null;
    if (t.professorId === usuario.id) return usuario.nome;
    return usuarios.find((u) => u.id === t.professorId)?.nome ?? null;
  };

  const lista = useMemo(() => {
    const q = normalizar(busca.trim());
    return q ? turmas.filter((t) => [t.nome, t.categoria, t.local].some((c) => c && normalizar(c).includes(q))) : turmas;
  }, [turmas, busca]);

  const sel = turmas.find((t) => t.id === selId);
  const disponiveis = useMemo(() => {
    if (!sel) return [];
    const ja = new Set(sel.alunos.map((a) => a.id));
    return alunos.filter((a) => !ja.has(a.id)).sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  }, [sel, alunos]);

  const matricular = async (e) => {
    e.preventDefault();
    if (!alunoId || !sel) return;
    setMatriculando(true);
    try {
      await api.matricular(sel.id, alunoId);
      toast.success(`${alunos.find((a) => a.id === alunoId)?.nome} entrou na ${sel.nome}`);
      setAlunoId('');
      recarregar();
    } catch (err) {
      toast.error('Não foi possível matricular', { description: err.message });
    } finally {
      setMatriculando(false);
    }
  };

  const trocarProfessor = async (e) => {
    const professorId = e.target.value;
    try {
      await api.definirProfessor(sel.id, professorId);
      const nome = professores.find((p) => p.id === professorId)?.nome;
      toast.success(nome ? `${nome} agora é o professor da ${sel.nome}` : `${sel.nome} ficou sem professor`);
      recarregar();
    } catch (err) {
      toast.error('Não foi possível trocar o professor', { description: err.message });
    }
  };

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  };

  const salvar = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.nome.trim()) v.nome = 'Dê um nome para a turma.';
    if (!(Number(form.vagas) >= 1)) v.vagas = 'A turma precisa de pelo menos 1 vaga.';
    setErros(v);
    if (Object.keys(v).length) return;
    setSalvando(true);
    try {
      const nova = await api.criarTurma({
        nome: form.nome.trim(), categoria: form.categoria, local: form.local.trim() || undefined,
        vagas: Number(form.vagas), professorId: form.professorId || undefined,
      });
      toast.success(`Turma ${nova.nome} criada`);
      setAberta(false);
      setSelId(nova.id);
      recarregar();
    } catch (err) {
      toast.error('Não foi possível criar a turma', { description: err.message });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pagina">
      {erro && (
        <div className="erro-carga" role="alert">
          <span>{erro}</span>
          <button className="btn btn-secundario btn-sm" onClick={recarregar}>Tentar de novo</button>
        </div>
      )}

      <div className="barra">
        <label className="com-icone busca">
          <span className="sr-only">Buscar turma</span>
          <IconeBusca />
          <input className="entrada" type="search" placeholder="Buscar turma…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <span className="espaco" />
        {admin && (
          <button className="btn btn-primario" onClick={() => { setForm(VAZIO); setErros({}); setAberta(true); }}>
            <IconeMais />Nova turma
          </button>
        )}
      </div>

      <div className="turmas">
        <div className="painel">
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr><th>Turma</th><th className="esconde-mobile">Professor</th><th className="esconde-mobile esconde-medio">Local e horário</th><th>Vagas</th></tr>
              </thead>
              <tbody>
                {carregando && Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} aria-hidden="true">
                    <td><span className="esqueleto" style={{ width: 110 }} /></td>
                    <td className="esconde-mobile"><span className="esqueleto" style={{ width: 100 }} /></td>
                    <td className="esconde-mobile esconde-medio"><span className="esqueleto" style={{ width: 150 }} /></td>
                    <td><span className="esqueleto" style={{ width: 110 }} /></td>
                  </tr>
                ))}
                {!carregando && lista.map((t) => (
                  <tr key={t.id} data-clicavel aria-selected={t.id === selId} tabIndex={0}
                    onClick={() => setSelId(t.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelId(t.id); } }}>
                    <td>
                      <span className="categoria"><i style={{ background: corCategoria(t.categoria) }} /><span className="pessoa-nome trunca">{t.nome}</span></span>
                    </td>
                    <td className="esconde-mobile">{nomeProfessor(t) || <span className="muted">Sem professor</span>}</td>
                    <td className="esconde-mobile esconde-medio"><span className="trunca" style={{ display: 'block' }}>{t.local || <span className="muted">—</span>}</span></td>
                    <td><Vagas t={t} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!carregando && !erro && turmas.length === 0 && (
            <div className="vazio">
              <strong>{admin ? 'Nenhuma turma ainda' : 'Você ainda não tem turmas'}</strong>
              <p>{admin
                ? 'Crie a primeira turma com categoria e número de vagas. Depois é só matricular os alunos.'
                : 'Quando a secretaria colocar você como professor de uma turma, ela aparece aqui.'}</p>
            </div>
          )}
          {!carregando && turmas.length > 0 && lista.length === 0 && (
            <div className="vazio"><strong>Nenhuma turma encontrada</strong><p>Nada corresponde a “{busca}”.</p></div>
          )}
        </div>

        {sel && (
          <section className="painel detalhe" aria-label={`Turma ${sel.nome}`}>
            <div className="painel-cab">
              <h2>{sel.nome}</h2>
              <span className="num">{plural(sel.vagasOcupadas, 'aluno', 'alunos')} · {sel.vagas} vagas</span>
            </div>
            {admin && (
              <div className="detalhe-corpo">
                <div className="campo">
                  <label htmlFor="t-prof">Professor</label>
                  <select id="t-prof" className="entrada" value={sel.professorId || ''} onChange={trocarProfessor}>
                    <option value="">Sem professor</option>
                    {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  {professores.length === 0 && <span className="dica">Crie uma conta de professor em Usuários para escolher aqui.</span>}
                </div>
                {sel.vagasDisponiveis <= 0 ? (
                  <span className="etiqueta bad">Turma lotada: sem vagas para novas matrículas</span>
                ) : (
                  <form className="campo" onSubmit={matricular}>
                    <label htmlFor="t-aluno">Matricular aluno</label>
                    <div className="matricula">
                      <select id="t-aluno" className="entrada" value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
                        <option value="">Escolha um aluno…</option>
                        {disponiveis.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                      </select>
                      <button className="btn btn-primario" type="submit" disabled={!alunoId || matriculando}>
                        {matriculando ? 'Matriculando…' : 'Matricular'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            {sel.alunos.length === 0 ? (
              <div className="vazio" style={{ paddingTop: 16 }}>
                <strong>Turma sem alunos</strong>
                {admin && <p>Escolha um aluno acima para fazer a primeira matrícula.</p>}
              </div>
            ) : (
              <ol className="lista-alunos">
                {sel.alunos.map((a, i) => (
                  <li key={a.id}>
                    <span className="camisa num">{i + 1}</span>
                    <span className="avatar">{iniciais(a.nome)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="pessoa-nome trunca">{a.nome}</div>
                      <div className="pessoa-sub">{idade(a.dataNascimento) ?? '—'} anos</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>

      {admin && (
        <Gaveta
          aberta={aberta}
          aoFechar={() => !salvando && setAberta(false)}
          titulo="Nova turma"
          descricao="A turma respeita o limite de vagas nas matrículas."
          onSubmit={salvar}
          rodape={(
            <>
              <button type="button" className="btn btn-fantasma" onClick={() => setAberta(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primario" disabled={salvando}>{salvando ? 'Salvando…' : 'Criar turma'}</button>
            </>
          )}
        >
          <div className="campo">
            <label htmlFor="t-nome">Nome da turma</label>
            <input id="t-nome" className="entrada" value={form.nome} onChange={set('nome')}
              placeholder="Ex.: Sub-11 Tarde" aria-invalid={!!erros.nome} autoComplete="off" />
            {erros.nome && <span className="dica erro">{erros.nome}</span>}
          </div>
          <div className="linha-dupla">
            <div className="campo">
              <label htmlFor="t-cat">Categoria</label>
              <select id="t-cat" className="entrada" value={form.categoria} onChange={set('categoria')}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="t-vagas">Vagas</label>
              <input id="t-vagas" className="entrada num" type="number" min="1" max="60" value={form.vagas}
                onChange={set('vagas')} aria-invalid={!!erros.vagas} />
              {erros.vagas && <span className="dica erro">{erros.vagas}</span>}
            </div>
          </div>
          <div className="campo">
            <label htmlFor="t-novo-prof">Professor <span className="opcional">(opcional)</span></label>
            <select id="t-novo-prof" className="entrada" value={form.professorId} onChange={set('professorId')}>
              <option value="">Sem professor</option>
              {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="t-local">Local e horário <span className="opcional">(opcional)</span></label>
            <input id="t-local" className="entrada" value={form.local} onChange={set('local')}
              placeholder="Ex.: Campo 2 · seg e qua, 16h" />
          </div>
        </Gaveta>
      )}
    </div>
  );
}
