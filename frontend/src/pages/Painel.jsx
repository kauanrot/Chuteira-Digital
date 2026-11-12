import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { Estatistica, ItemLista, Rosca } from '../components/Cartoes.jsx';
import {
  IconeAlunos, IconeCalendario, IconeChamada, IconeLista, IconeProfessor, IconeTendencia, IconeTurmas,
} from '../components/Icones.jsx';
import { Frequencia } from './Alunos.jsx';
import { fmtDataCurta, idade, iniciais, plural } from '../util.js';

/** Soma presenças e registros de uma lista de chamadas. */
function somar(chamadas) {
  let presentes = 0, total = 0;
  chamadas.forEach((c) => (c.registros || []).forEach((r) => { total += 1; if (r.presente) presentes += 1; }));
  return { presentes, total };
}
const pct = ({ presentes, total }) => (total ? `${Math.round((presentes / total) * 100)}%` : '—');

function PainelEscola({ dados, usuario, irPara }) {
  const { alunos, turmas, chamadas, usuarios, carregando, turmaDoAluno, frequencia } = dados;
  const admin = usuario.perfil === 'ADMIN';

  const resumo = useMemo(() => {
    const geral = somar(chamadas);
    const lotadas = turmas.filter((t) => t.vagasDisponiveis <= 0).length;
    const baixa = alunos
      .map((a) => {
        const r = frequencia.get(String(a.id)) || [];
        return { a, r, taxa: r.length ? r.filter(Boolean).length / r.length : 1 };
      })
      .filter((x) => x.r.length >= 4 && x.taxa < 0.7)
      .sort((x, y) => x.taxa - y.taxa);
    const ultimas = [...chamadas].sort((x, y) => y.data.localeCompare(x.data)).slice(0, 5);
    return { geral, lotadas, baixa, ultimas };
  }, [alunos, turmas, chamadas, frequencia]);

  const nomeTurma = (id) => turmas.find((t) => t.id === id)?.nome ?? 'Turma';
  const professores = usuarios.filter((u) => u.perfil === 'PROFESSOR').length;

  return (
    <div className="pagina">
      <section className="estatisticas" aria-label="Resumo">
        {admin ? (
          <>
            <Estatistica Icone={IconeAlunos} valor={alunos.length} rotulo="Alunos" carregando={carregando} />
            <Estatistica Icone={IconeTurmas} valor={turmas.length} rotulo="Turmas" carregando={carregando}
              selo={resumo.lotadas ? plural(resumo.lotadas, 'lotada', 'lotadas') : null} tomSelo="bad" />
            <Estatistica Icone={IconeProfessor} valor={professores} rotulo="Professores" carregando={carregando} />
            <Estatistica Icone={IconeTendencia} valor={pct(resumo.geral)} rotulo="Presença média" carregando={carregando} />
          </>
        ) : (
          <>
            <Estatistica Icone={IconeTurmas} valor={turmas.length} rotulo="Turmas" carregando={carregando} />
            <Estatistica Icone={IconeAlunos} valor={alunos.length} rotulo="Alunos" carregando={carregando} />
            <Estatistica Icone={IconeTendencia} valor={pct(resumo.geral)} rotulo="Presença média" carregando={carregando} />
          </>
        )}
      </section>

      <div className="grade-2">
        <section className="painel">
          <div className="painel-cab"><h2>{admin ? 'Turmas' : 'Minhas turmas'}</h2></div>
          {turmas.length === 0 && !carregando ? (
            <div className="vazio"><p>{admin ? 'Nenhuma turma cadastrada ainda.' : 'Você ainda não é professor de nenhuma turma.'}</p></div>
          ) : (
            <ul className="lista">
              {turmas.slice(0, 6).map((t) => (
                <ItemLista key={t.id} icone={<IconeCalendario />} titulo={t.nome} onClick={() => irPara('turmas')}
                  sub={`${plural(t.vagasOcupadas, 'aluno', 'alunos')}${t.local ? ` · ${t.local}` : ''}`}
                  extra={t.vagasDisponiveis <= 0 ? <span className="etiqueta bad">Lotada</span> : null} />
              ))}
            </ul>
          )}
        </section>

        {admin ? (
          <section className="painel">
            <div className="painel-cab"><h2>Resumo de chamadas</h2></div>
            <Rosca presentes={resumo.geral.presentes} total={resumo.geral.total} />
          </section>
        ) : (
          <section className="painel">
            <div className="painel-cab"><h2>Ações rápidas</h2></div>
            <div className="acoes-rapidas">
              <button className="btn btn-primario" onClick={() => irPara('chamada')}><IconeChamada />Fazer chamada</button>
              <button className="btn btn-secundario" onClick={() => irPara('turmas')}><IconeLista />Ver turmas</button>
            </div>
          </section>
        )}
      </div>

      <div className="grade-2">
        <section className="painel">
          <div className="painel-cab"><h2>Frequência baixa</h2><span>abaixo de 70%</span></div>
          {resumo.baixa.length === 0 ? (
            <div className="vazio"><strong>Ninguém em alerta</strong><p>Todos os alunos estão com 70% de presença ou mais.</p></div>
          ) : (
            <ul className="lista">
              {resumo.baixa.slice(0, 5).map(({ a, r }) => (
                <ItemLista key={a.id} icone={iniciais(a.nome)} titulo={a.nome}
                  sub={turmaDoAluno.get(a.id)?.nome ?? 'Sem turma'} extra={<Frequencia registros={r} />} />
              ))}
            </ul>
          )}
        </section>

        <section className="painel">
          <div className="painel-cab">
            <h2>Últimas chamadas</h2>
            <button className="btn btn-fantasma btn-sm" onClick={() => irPara('chamada')}>Fazer chamada</button>
          </div>
          {resumo.ultimas.length === 0 ? (
            <div className="vazio"><p>Nenhuma chamada registrada ainda.</p></div>
          ) : (
            <ul className="lista">
              {resumo.ultimas.map((c) => {
                const s = somar([c]);
                return (
                  <ItemLista key={c.id} icone={<IconeChamada />} titulo={nomeTurma(c.turmaId)} sub={fmtDataCurta(c.data)}
                    extra={<span className="etiqueta neutra num">{s.presentes} de {s.total}</span>} />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function PainelResponsavel({ irPara }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    api.meusAlunos()
      .then((d) => { if (ativo) setItens(d); })
      .catch((e) => { if (ativo) setErro(e.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const todas = itens.flatMap((i) => i.presencas);
  const presentes = todas.filter((p) => p.presente).length;
  const recentes = itens
    .flatMap((i) => i.presencas.map((p) => ({ ...p, aluno: i.aluno, turma: i.turmas.find((t) => t.id === p.turmaId) })))
    .sort((x, y) => y.data.localeCompare(x.data))
    .slice(0, 5);

  return (
    <div className="pagina">
      {erro && <div className="erro-carga" role="alert"><span>{erro}</span></div>}
      <div className="grade-2 larga-esq">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <section className="painel">
            <div className="painel-cab"><h2>Meus alunos</h2></div>
            {carregando && <div className="painel-corpo"><span className="esqueleto" style={{ width: 200 }} /></div>}
            {!carregando && itens.length === 0 && (
              <div className="vazio">
                <strong>Nenhum aluno ligado à sua conta</strong>
                <p>Peça à secretaria da escola para vincular o aluno ao seu cadastro.</p>
              </div>
            )}
            <ul className="lista">
              {itens.map(({ aluno, turmas }) => (
                <ItemLista key={aluno.id} icone={iniciais(aluno.nome)} titulo={aluno.nome} onClick={() => irPara('meus-alunos')}
                  sub={`${turmas.map((t) => t.nome).join(', ') || 'Sem turma'} · ${idade(aluno.dataNascimento)} anos`} />
              ))}
            </ul>
          </section>

          <section className="painel">
            <div className="painel-cab"><h2>Últimos treinos</h2></div>
            {recentes.length === 0 && !carregando ? (
              <div className="vazio"><p>Nenhum treino registrado ainda.</p></div>
            ) : (
              <ul className="lista">
                {recentes.map((p) => (
                  <ItemLista key={`${p.aluno.id}-${p.turmaId}-${p.data}`} icone={<IconeCalendario />}
                    titulo={p.turma?.nome ?? 'Turma'} sub={`${fmtDataCurta(p.data)} · ${p.aluno.nome.split(' ')[0]}`}
                    extra={<span className={`etiqueta ${p.presente ? 'ok' : 'bad'}`}>{p.presente ? 'Presente' : 'Falta'}</span>} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="painel">
          <div className="painel-cab"><h2>Frequência</h2></div>
          <Rosca presentes={presentes} total={todas.length} rotuloTotal="Treinos" />
        </section>
      </div>
    </div>
  );
}

export default function Painel({ dados, usuario, irPara }) {
  return usuario.perfil === 'RESPONSAVEL'
    ? <PainelResponsavel irPara={irPara} />
    : <PainelEscola dados={dados} usuario={usuario} irPara={irPara} />;
}
