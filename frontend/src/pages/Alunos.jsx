import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../api.js';
import Gaveta from '../components/Gaveta.jsx';
import { IconeBusca, IconeEditar, IconeMais, IconeSeta } from '../components/Icones.jsx';
import { corCategoria, hoje, idade, iniciais, normalizar, plural } from '../util.js';

const VAZIO = { nome: '', dataNascimento: '', responsavel: '', telefone: '', email: '', responsavelUsuarioId: '' };
const POR_PAGINA = 8;

function mascaraTelefone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function Frequencia({ registros }) {
  const ultimos = registros || [];
  const vazios = Array.from({ length: Math.max(0, 8 - ultimos.length) });
  const pct = ultimos.length ? Math.round((ultimos.filter(Boolean).length / ultimos.length) * 100) : null;
  const rotulo = ultimos.length
    ? `${ultimos.filter(Boolean).length} presenças em ${ultimos.length} treinos`
    : 'Sem treinos registrados';
  return (
    <span className="freq" title={rotulo} aria-label={rotulo}>
      {vazios.map((_, i) => <b key={`v${i}`} className="x" />)}
      {ultimos.map((p, i) => <b key={i} className={p ? 'p' : 'f'} />)}
      <span className={`freq-pct num ${pct !== null && pct < 70 ? 'baixa' : ''}`}>{pct === null ? '—' : `${pct}%`}</span>
    </span>
  );
}

export function Paginacao({ pagina, total, porPagina, aoMudar }) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  if (paginas <= 1) return null;
  return (
    <nav className="paginacao" aria-label="Páginas">
      <button onClick={() => aoMudar(pagina - 1)} disabled={pagina === 1} aria-label="Página anterior">
        <span style={{ display: 'grid', transform: 'rotate(180deg)' }}><IconeSeta tamanho={14} /></span>
      </button>
      {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
        <button key={n} className="num" aria-current={n === pagina ? 'page' : undefined} onClick={() => aoMudar(n)}>{n}</button>
      ))}
      <button onClick={() => aoMudar(pagina + 1)} disabled={pagina === paginas} aria-label="Próxima página">
        <IconeSeta tamanho={14} />
      </button>
    </nav>
  );
}

function validar(form) {
  const erros = {};
  const anos = idade(form.dataNascimento);
  if (!form.nome.trim()) erros.nome = 'Informe o nome completo.';
  if (!form.dataNascimento) erros.dataNascimento = 'Informe a data de nascimento.';
  else if (form.dataNascimento > hoje()) erros.dataNascimento = 'A data não pode estar no futuro.';
  if (anos !== null && anos < 18 && !form.responsavel.trim())
    erros.responsavel = 'Obrigatório para alunos com menos de 18 anos.';
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) erros.email = 'Confira o e-mail.';
  return erros;
}

export default function Alunos({ dados }) {
  const { alunos, turmas, usuarios, carregando, erro, recarregar, turmaDoAluno, frequencia } = dados;
  const contasResponsavel = usuarios.filter((u) => u.perfil === 'RESPONSAVEL');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [pagina, setPagina] = useState(1);
  const [aberta, setAberta] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const categorias = useMemo(() => [...new Set(turmas.map((t) => t.categoria))], [turmas]);

  const lista = useMemo(() => {
    const q = normalizar(busca.trim());
    return alunos
      .filter((a) => {
        const t = turmaDoAluno.get(a.id);
        if (filtro === 'sem-turma' && t) return false;
        if (filtro !== 'todas' && filtro !== 'sem-turma' && t?.categoria !== filtro) return false;
        if (!q) return true;
        return [a.nome, a.responsavel, a.telefone, a.email].some((c) => c && normalizar(c).includes(q));
      })
      .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  }, [alunos, busca, filtro, turmaDoAluno]);

  useEffect(() => { setPagina(1); }, [busca, filtro]);
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, paginas);
  const visiveis = lista.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const anosForm = idade(form.dataNascimento);
  const menor = anosForm !== null && anosForm < 18;

  const set = (campo) => (e) => {
    const valor = campo === 'telefone' ? mascaraTelefone(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  };

  const abrirNovo = () => { setEditando(null); setForm(VAZIO); setErros({}); setAberta(true); };
  const abrirEdicao = (a) => {
    setEditando(a);
    setForm({
      nome: a.nome, dataNascimento: a.dataNascimento, responsavel: a.responsavel || '',
      telefone: a.telefone || '', email: a.email || '', responsavelUsuarioId: a.responsavelUsuarioId || '',
    });
    setErros({});
    setAberta(true);
  };
  const fechar = () => { if (!salvando) setAberta(false); };

  const salvar = async (e) => {
    e.preventDefault();
    const v = validar(form);
    setErros(v);
    if (Object.keys(v).length) return;
    setSalvando(true);
    // Na edição, campo esvaziado vai como null para limpar o valor antigo.
    const vazio = editando ? null : undefined;
    const corpo = {
      nome: form.nome.trim(),
      dataNascimento: form.dataNascimento,
      responsavel: form.responsavel.trim() || vazio,
      telefone: form.telefone || vazio,
      email: form.email.trim() || vazio,
      responsavelUsuarioId: form.responsavelUsuarioId || vazio,
    };
    try {
      if (editando) {
        const salvo = await api.atualizarAluno(editando.id, corpo);
        toast.success(`Dados de ${salvo.nome} atualizados`);
      } else {
        const novo = await api.criarAluno(corpo);
        toast.success(`${novo.nome} foi cadastrado`, { description: 'Agora é só matricular numa turma.' });
      }
      setAberta(false);
      recarregar();
    } catch (err) {
      toast.error(editando ? 'Não foi possível salvar' : 'Não foi possível cadastrar', { description: err.message });
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
          <span className="sr-only">Buscar aluno</span>
          <IconeBusca />
          <input className="entrada" type="search" placeholder="Buscar aluno…" value={busca}
            onChange={(e) => setBusca(e.target.value)} />
        </label>
        <label>
          <span className="sr-only">Filtrar por categoria</span>
          <select className="entrada filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todas">Todas as categorias</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="sem-turma">Sem turma</option>
          </select>
        </label>
        <span className="espaco" />
        <button className="btn btn-primario" onClick={abrirNovo}><IconeMais />Cadastrar aluno</button>
      </div>

      <div className="painel">
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Turma</th>
                <th className="esconde-mobile">Responsável</th>
                <th className="esconde-mobile">Últimos 8 treinos</th>
                <th className="direita">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} aria-hidden="true">
                  <td><div className="pessoa"><span className="avatar" /><span className="esqueleto" style={{ width: 150 }} /></div></td>
                  <td><span className="esqueleto" style={{ width: 24 }} /></td>
                  <td><span className="esqueleto" style={{ width: 90 }} /></td>
                  <td className="esconde-mobile"><span className="esqueleto" style={{ width: 130 }} /></td>
                  <td className="esconde-mobile"><span className="esqueleto" style={{ width: 120 }} /></td>
                  <td />
                </tr>
              ))}

              {!carregando && visiveis.map((a) => {
                const t = turmaDoAluno.get(a.id);
                const anos = idade(a.dataNascimento);
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="pessoa">
                        <span className="avatar">{iniciais(a.nome)}</span>
                        <span className="pessoa-nome trunca" title={a.nome}>{a.nome}</span>
                      </div>
                    </td>
                    <td className="num">{anos ?? '—'}</td>
                    <td>
                      {t
                        ? <span className="categoria"><i style={{ background: corCategoria(t.categoria) }} />{t.nome}</span>
                        : <span className="etiqueta warn">Sem turma</span>}
                    </td>
                    <td className="esconde-mobile">
                      <div className="trunca" title={a.responsavel || ''}>{a.responsavel || <span className="muted">—</span>}</div>
                      <div className="pessoa-sub num">{a.telefone || a.email || ''}</div>
                    </td>
                    <td className="esconde-mobile"><Frequencia registros={frequencia.get(String(a.id))} /></td>
                    <td>
                      <div className="acoes">
                        <button className="icone-btn" onClick={() => abrirEdicao(a)} aria-label={`Editar ${a.nome}`} title="Editar">
                          <IconeEditar tamanho={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!carregando && !erro && alunos.length === 0 && (
          <div className="vazio">
            <strong>Nenhum aluno cadastrado</strong>
            <p>Cadastre o primeiro aluno para começar a montar as turmas e fazer a chamada.</p>
            <button className="btn btn-primario" onClick={abrirNovo}><IconeMais />Cadastrar aluno</button>
          </div>
        )}
        {!carregando && alunos.length > 0 && lista.length === 0 && (
          <div className="vazio">
            <strong>Nenhum aluno encontrado</strong>
            <p>Nada corresponde a “{busca || 'este filtro'}”. Confira a grafia ou limpe os filtros.</p>
            <button className="btn btn-secundario" onClick={() => { setBusca(''); setFiltro('todas'); }}>Limpar filtros</button>
          </div>
        )}

        <Paginacao pagina={paginaAtual} total={lista.length} porPagina={POR_PAGINA} aoMudar={setPagina} />
      </div>
      {!carregando && lista.length > 0 && (
        <p className="muted" style={{ fontSize: 12.5 }}>
          {plural(lista.length, 'aluno', 'alunos')}{lista.length !== alunos.length ? ` de ${alunos.length}` : ''}
        </p>
      )}

      <Gaveta
        aberta={aberta}
        aoFechar={fechar}
        titulo={editando ? 'Editar aluno' : 'Novo aluno'}
        descricao={editando ? 'Altere os dados e salve.' : 'Depois do cadastro, matricule o aluno em uma turma.'}
        onSubmit={salvar}
        rodape={(
          <>
            <button type="button" className="btn btn-fantasma" onClick={fechar}>Cancelar</button>
            <button type="submit" className="btn btn-primario" disabled={salvando}>
              {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar aluno'}
            </button>
          </>
        )}
      >
        <div className="campo">
          <label htmlFor="a-nome">Nome completo</label>
          <input id="a-nome" className="entrada" value={form.nome} onChange={set('nome')}
            placeholder="Ex.: João Pedro da Silva" aria-invalid={!!erros.nome} autoComplete="off" />
          {erros.nome && <span className="dica erro">{erros.nome}</span>}
        </div>
        <div className="campo">
          <label htmlFor="a-nasc">Data de nascimento</label>
          <input id="a-nasc" className="entrada" type="date" max={hoje()} value={form.dataNascimento}
            onChange={set('dataNascimento')} aria-invalid={!!erros.dataNascimento} />
          {erros.dataNascimento
            ? <span className="dica erro">{erros.dataNascimento}</span>
            : anosForm !== null && anosForm >= 0 && <span className="dica">{anosForm} anos{menor ? ' · precisa de responsável' : ''}</span>}
        </div>
        <div className="campo">
          <label htmlFor="a-resp">Responsável {menor ? '' : <span className="opcional">(opcional)</span>}</label>
          <input id="a-resp" className="entrada" value={form.responsavel} onChange={set('responsavel')}
            placeholder="Nome do pai, mãe ou responsável" aria-invalid={!!erros.responsavel} />
          {erros.responsavel && <span className="dica erro">{erros.responsavel}</span>}
        </div>
        <div className="linha-dupla">
          <div className="campo">
            <label htmlFor="a-tel">Telefone <span className="opcional">(opcional)</span></label>
            <input id="a-tel" className="entrada num" inputMode="tel" value={form.telefone}
              onChange={set('telefone')} placeholder="(11) 90000-0000" />
          </div>
          <div className="campo">
            <label htmlFor="a-email">E-mail <span className="opcional">(opcional)</span></label>
            <input id="a-email" className="entrada" type="email" value={form.email}
              onChange={set('email')} placeholder="nome@email.com" aria-invalid={!!erros.email} />
            {erros.email && <span className="dica erro">{erros.email}</span>}
          </div>
        </div>
        {contasResponsavel.length > 0 && (
          <div className="campo">
            <label htmlFor="a-conta">Conta do responsável <span className="opcional">(opcional)</span></label>
            <select id="a-conta" className="entrada" value={form.responsavelUsuarioId} onChange={set('responsavelUsuarioId')}>
              <option value="">Sem conta de acesso</option>
              {contasResponsavel.map((u) => <option key={u.id} value={u.id}>{u.nome} · {u.email}</option>)}
            </select>
            <span className="dica">Com a conta ligada, o responsável vê a turma e a frequência deste aluno.</span>
          </div>
        )}
      </Gaveta>
    </div>
  );
}
