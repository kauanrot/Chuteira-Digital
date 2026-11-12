import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { Frequencia } from './Alunos.jsx';
import { corCategoria, fmtDataCurta, idade, iniciais } from '../util.js';

// Área do responsável: só os alunos ligados à conta dele.
export default function MeusAlunos() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setErro('');
    try {
      setItens(await api.meusAlunos());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="pagina">
      {erro && (
        <div className="erro-carga" role="alert">
          <span>{erro}</span>
          <button className="btn btn-secundario btn-sm" onClick={carregar}>Tentar de novo</button>
        </div>
      )}

      {carregando && <div className="painel" style={{ padding: 20 }}><span className="esqueleto" style={{ width: 220 }} /></div>}

      {!carregando && !erro && itens.length === 0 && (
        <div className="painel vazio">
          <strong>Nenhum aluno ligado à sua conta</strong>
          <p>Peça à secretaria da escola para vincular o aluno ao seu cadastro.</p>
        </div>
      )}

      {itens.map(({ aluno, turmas, presencas }) => {
        const total = presencas.length;
        const presentes = presencas.filter((p) => p.presente).length;
        return (
          <section className="painel" key={aluno.id}>
            <div className="painel-cab">
              <div className="pessoa">
                <span className="avatar">{iniciais(aluno.nome)}</span>
                <div>
                  <h2>{aluno.nome}</h2>
                  <span>{idade(aluno.dataNascimento)} anos</span>
                </div>
              </div>
              <Frequencia registros={presencas.slice(-8).map((p) => p.presente)} />
            </div>

            <div className="filho-corpo">
              <div>
                <h3>Turma</h3>
                {turmas.length === 0 ? <p className="muted">Ainda não está matriculado em nenhuma turma.</p> : turmas.map((t) => (
                  <div key={t.id} className="filho-turma">
                    <span className="categoria"><i style={{ background: corCategoria(t.categoria) }} />{t.nome}</span>
                    {t.local && <span className="muted">{t.local}</span>}
                  </div>
                ))}
              </div>
              <div>
                <h3>Presença</h3>
                <p>{total === 0 ? <span className="muted">Nenhum treino registrado ainda.</span>
                  : <><strong className="num">{presentes}</strong> de <span className="num">{total}</span> treinos</>}</p>
              </div>
            </div>

            {total > 0 && (
              <ul className="historico">
                {[...presencas].reverse().slice(0, 8).map((p) => (
                  <li key={`${p.turmaId}-${p.data}`} className="filho-treino">
                    <span>{fmtDataCurta(p.data)}</span>
                    <span className="muted trunca">{turmas.find((t) => t.id === p.turmaId)?.nome}</span>
                    <span className={`etiqueta ${p.presente ? 'ok' : 'bad'}`}>{p.presente ? 'Presente' : 'Falta'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
