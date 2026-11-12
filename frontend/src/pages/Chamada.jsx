import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../api.js';
import { IconeCheck, IconeFechar } from '../components/Icones.jsx';
import { fmtDataCurta, hoje, iniciais, plural } from '../util.js';

export default function Chamada({ dados, usuario }) {
  const { turmas, chamadas, carregando, recarregar } = dados;
  const [turmaId, setTurmaId] = useState(() => turmas[0]?.id ?? '');
  const [data, setData] = useState(hoje());
  const [faltas, setFaltas] = useState(new Set());
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!turmaId && turmas.length) setTurmaId(turmas[0].id);
  }, [turmas, turmaId]);
  useEffect(() => { setFaltas(new Set()); }, [turmaId, data]);

  const turma = turmas.find((t) => t.id === turmaId);
  const historico = useMemo(
    () => chamadas.filter((c) => c.turmaId === turmaId).sort((a, b) => b.data.localeCompare(a.data)),
    [chamadas, turmaId],
  );
  const jaFeita = historico.find((c) => c.data === data);
  const presencaSalva = useMemo(
    () => new Map((jaFeita?.registros || []).map((r) => [r.alunoId, r.presente])),
    [jaFeita],
  );

  const total = turma?.alunos.length ?? 0;
  const presentes = jaFeita ? jaFeita.registros.filter((r) => r.presente).length : total - faltas.size;

  const alternar = (id) => setFaltas((f) => {
    const n = new Set(f);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const salvar = async () => {
    setSalvando(true);
    try {
      const registros = turma.alunos.map((a) => ({ alunoId: a.id, presente: !faltas.has(a.id) }));
      await api.registrarChamada(turma.id, { data, registros });
      toast.success('Chamada salva', { description: `${turma.nome} · ${presentes} de ${total} presentes` });
      recarregar();
    } catch (err) {
      toast.error('Não foi possível salvar a chamada', { description: err.message });
    } finally {
      setSalvando(false);
    }
  };

  if (!carregando && turmas.length === 0) {
    return (
      <div className="pagina">
        <div className="painel vazio">
          <strong>Nenhuma turma para fazer chamada</strong>
          <p>{usuario?.perfil === 'PROFESSOR'
            ? 'Você ainda não é professor de nenhuma turma. Fale com a secretaria.'
            : 'Crie uma turma e matricule alunos antes de fazer a chamada.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina">
      <section className="painel">
        <div className="chamada-filtros">
          <div className="campo">
            <label htmlFor="c-turma">Turma</label>
            <select id="c-turma" className="entrada" value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
              {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="c-data">Data</label>
            <input id="c-data" className="entrada num" type="date" max={hoje()} value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>

        {jaFeita && (
          <div className="aviso-linha">
            <span className="etiqueta neutra">Chamada de {fmtDataCurta(data)} já registrada. Abaixo, como ficou.</span>
          </div>
        )}

        {turma && total === 0 ? (
          <div className="vazio">
            <strong>Nenhum aluno matriculado</strong>
            <p>Matricule alunos na tela de Turmas para poder fazer a chamada desta turma.</p>
          </div>
        ) : (
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead><tr><th>Aluno</th><th className="direita">Presença</th></tr></thead>
              <tbody>
                {carregando && Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} aria-hidden="true">
                    <td><div className="pessoa"><span className="avatar" /><span className="esqueleto" style={{ width: 160 }} /></div></td>
                    <td />
                  </tr>
                ))}
                {turma?.alunos.map((a) => {
                  const presente = jaFeita ? presencaSalva.get(a.id) !== false : !faltas.has(a.id);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="pessoa">
                          <span className="avatar">{iniciais(a.nome)}</span>
                          <span className="pessoa-nome trunca">{a.nome}</span>
                        </div>
                      </td>
                      <td className="direita">
                        <button type="button" className="presenca-chip" aria-pressed={presente} disabled={!!jaFeita}
                          onClick={() => alternar(a.id)} aria-label={`${a.nome}: ${presente ? 'presente' : 'ausente'}`}>
                          <span className="caixa">{presente ? <IconeCheck tamanho={12} /> : <IconeFechar tamanho={12} />}</span>
                          {presente ? 'Presente' : 'Ausente'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {turma && total > 0 && (
          <div className="chamada-rodape">
            <span className="resumo-num"><strong className="num">{presentes}</strong> de <span className="num">{total}</span> presentes</span>
            <button className="btn btn-primario" onClick={salvar} disabled={salvando || !!jaFeita}>
              <IconeCheck />{salvando ? 'Salvando…' : jaFeita ? 'Chamada já salva' : 'Salvar chamada'}
            </button>
          </div>
        )}
      </section>

      {turma && (
        <section className="painel">
          <div className="painel-cab">
            <h2>Treinos anteriores</h2>
            <span>{plural(historico.length, 'registro', 'registros')}</span>
          </div>
          {historico.length === 0 ? (
            <div className="vazio"><p>Nenhuma chamada registrada para esta turma ainda.</p></div>
          ) : (
            <ul className="historico">
              {historico.slice(0, 8).map((c) => {
                const p = c.registros.filter((r) => r.presente).length;
                const n = c.registros.length;
                return (
                  <li key={c.id}>
                    <span>{fmtDataCurta(c.data)}</span>
                    <div className="vagas-barra" role="presentation"><i style={{ transform: `scaleX(${n ? p / n : 0})` }} /></div>
                    <span className="num direita">{p}/{n} · {n ? Math.round((p / n) * 100) : 0}%</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
