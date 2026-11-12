import { IconeSeta } from './Icones.jsx';

/** Cartão de número do dashboard: ícone, valor e rótulo (com selo opcional). */
export function Estatistica({ Icone, valor, rotulo, selo, tomSelo = 'ok', carregando }) {
  return (
    <div className="painel estatistica">
      <span className="estatistica-icone"><Icone tamanho={28} /></span>
      {carregando
        ? <span className="esqueleto" style={{ width: 64, height: 26 }} />
        : <span className="estatistica-valor num">{valor}</span>}
      <span className="estatistica-rotulo">
        {rotulo}
        {selo && !carregando && <span className={`etiqueta ${tomSelo}`}>{selo}</span>}
      </span>
    </div>
  );
}

/** Rosca de presença: percentual no centro, legenda com presentes, faltas e total. */
export function Rosca({ presentes, total, rotuloTotal = 'Total' }) {
  const pct = total ? Math.round((presentes / total) * 100) : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="rosca-bloco">
      <div className="rosca" role="img" aria-label={total ? `${pct}% de presença` : 'Sem chamadas registradas'}>
        <svg viewBox="0 0 120 120">
          <circle className="trilho" cx="60" cy="60" r={r} />
          <circle className="valor" cx="60" cy="60" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        <span className="rosca-centro num">{total ? `${pct}%` : '—'}</span>
      </div>
      <div className="legenda">
        <div><span><i />Presenças</span><strong className="num">{presentes}</strong></div>
        <div><span><i className="falta" />Faltas</span><strong className="num">{total - presentes}</strong></div>
        <div className="total"><span>{rotuloTotal}</span><strong className="num">{total}</strong></div>
      </div>
    </div>
  );
}

/** Linha de lista com ícone, título, subtítulo e seta; vira botão quando recebe onClick. */
export function ItemLista({ icone, titulo, sub, onClick, extra }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <li>
      <Tag className="lista-item" onClick={onClick}>
        {icone && <span className="lista-icone">{icone}</span>}
        <span className="lista-texto"><strong>{titulo}</strong>{sub && <span>{sub}</span>}</span>
        {extra}
        {onClick && <IconeSeta tamanho={16} />}
      </Tag>
    </li>
  );
}
