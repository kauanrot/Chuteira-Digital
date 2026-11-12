import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { api, MODO_EXEMPLO } from './api.js';
import { useDados } from './dados.js';
import {
  EVENTO_SESSAO_EXPIRADA, guardarPreferencia, guardarToken, lerPreferencia, lerToken, limparToken,
} from './sessao.js';
import {
  IconeAlunos, IconeChamada, IconeLua, IconePainel, IconeRecolher, IconeSair, IconeSetaBaixo,
  IconeSino, IconeSol, IconeTurmas, IconeUsuarios, Logo,
} from './components/Icones.jsx';
import { iniciais, plural, ROTULO_PERFIL } from './util.js';
import Login from './pages/Login.jsx';
import Painel from './pages/Painel.jsx';
import Alunos from './pages/Alunos.jsx';
import Turmas from './pages/Turmas.jsx';
import Chamada from './pages/Chamada.jsx';
import Usuarios from './pages/Usuarios.jsx';
import MeusAlunos from './pages/MeusAlunos.jsx';

// O que cada perfil enxerga no menu. A API aplica as mesmas regras; aqui é só
// para não mostrar o que a pessoa não pode usar.
const MENU = {
  ADMIN: ['painel', 'alunos', 'turmas', 'chamada', 'usuarios'],
  PROFESSOR: ['painel', 'turmas', 'chamada'],
  RESPONSAVEL: ['painel', 'meus-alunos'],
};
const SECOES = {
  painel: { rotulo: 'Dashboard', curto: 'Início', Icone: IconePainel },
  alunos: { rotulo: 'Alunos', Icone: IconeAlunos },
  turmas: { rotulo: 'Turmas', Icone: IconeTurmas },
  chamada: { rotulo: 'Chamadas', Icone: IconeChamada },
  usuarios: { rotulo: 'Usuários', Icone: IconeUsuarios },
  'meus-alunos': { rotulo: 'Meus Alunos', curto: 'Alunos', Icone: IconeAlunos },
};
const rotuloDa = (id, perfil) => (id === 'turmas' && perfil === 'PROFESSOR' ? 'Minhas Turmas' : SECOES[id].rotulo);

/** Menu suspenso que fecha com clique fora ou Esc. */
function MenuSuspenso({ botao, children }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => { if (!ref.current?.contains(e.target)) setAberto(false); };
    const tecla = (e) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('pointerdown', fora);
      document.removeEventListener('keydown', tecla);
    };
  }, [aberto]);
  return (
    <div className="menu-ancora" ref={ref}>
      {botao({ aberto, alternar: () => setAberto((a) => !a) })}
      {aberto && <div className="menu" role="menu" onClick={() => setAberto(false)}>{children}</div>}
    </div>
  );
}

// Avisos do sino: derivados dos dados que o perfil já carrega.
function useAvisos(dados, ir) {
  return useMemo(() => {
    const { alunos, turmas, frequencia, turmaDoAluno } = dados;
    const avisos = [];
    const baixa = alunos.filter((a) => {
      const r = frequencia.get(String(a.id)) || [];
      return r.length >= 4 && r.filter(Boolean).length / r.length < 0.7;
    });
    if (baixa.length) {
      avisos.push({
        id: 'freq',
        titulo: `${plural(baixa.length, 'aluno', 'alunos')} com frequência baixa`,
        sub: baixa.slice(0, 3).map((a) => a.nome.split(' ')[0]).join(', ') + (baixa.length > 3 ? '…' : ''),
        ir: () => ir('painel'),
      });
    }
    turmas.filter((t) => t.vagasDisponiveis <= 0).forEach((t) => avisos.push({
      id: `lotada-${t.id}`, titulo: `${t.nome} está lotada`, sub: `${t.vagasOcupadas} de ${t.vagas} vagas`, ir: () => ir('turmas'),
    }));
    const semTurma = alunos.filter((a) => !turmaDoAluno.get(a.id)).length;
    if (semTurma) {
      avisos.push({ id: 'sem-turma', titulo: `${plural(semTurma, 'aluno', 'alunos')} sem turma`, sub: 'Matricule na tela de Turmas', ir: () => ir('turmas') });
    }
    return avisos;
  }, [dados, ir]);
}

function AreaLogada({ usuario, aoSair, tema, alternarTema }) {
  const secoes = MENU[usuario.perfil] || [];
  const [aba, setAba] = useState(secoes[0]);
  const [recolhida, setRecolhida] = useState(() => lerPreferencia('sidebar', 'aberta') === 'recolhida');
  const dados = useDados(usuario);
  const avisos = useAvisos(dados, setAba);
  const temSino = usuario.perfil !== 'RESPONSAVEL';

  const alternarSidebar = () => setRecolhida((r) => {
    guardarPreferencia('sidebar', r ? 'aberta' : 'recolhida');
    return !r;
  });

  return (
    <div className="app" data-recolhida={recolhida}>
      <aside className="sidebar">
        <div className="sidebar-topo">
          <div className="marca">
            <Logo />
            <span className="marca-nome">Chuteira<br />Digital</span>
          </div>
          <button className="recolher" onClick={alternarSidebar}
            aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'} aria-expanded={!recolhida}>
            <IconeRecolher />
          </button>
        </div>
        {/* Trocar de seção é algo feito o dia inteiro: sem animação. */}
        <nav className="nav" aria-label="Seções">
          {secoes.map((id) => {
            const { Icone } = SECOES[id];
            const rotulo = rotuloDa(id, usuario.perfil);
            return (
              <button key={id} className="nav-item" aria-current={aba === id ? 'page' : undefined}
                onClick={() => setAba(id)} title={recolhida ? rotulo : undefined} aria-label={rotulo}>
                <Icone />
                <span>{rotulo}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-rodape">
          {MODO_EXEMPLO && <span className="selo-prototipo">Dados de exemplo</span>}
        </div>
      </aside>

      <div className="principal">
        <header className="topo">
          <div className="topo-esq">
            <span className="topo-marca"><Logo tamanho={26} /></span>
            <div className="topo-titulo">
              <h1>{rotuloDa(aba, usuario.perfil)}</h1>
              <p>{ROTULO_PERFIL[usuario.perfil]}</p>
            </div>
          </div>
          <div className="topo-acoes">
            <button className="icone-btn" onClick={alternarTema}
              aria-label={tema === 'escuro' ? 'Usar tema claro' : 'Usar tema escuro'}>
              {tema === 'escuro' ? <IconeLua /> : <IconeSol />}
            </button>
            {temSino && (
              <MenuSuspenso botao={({ aberto, alternar }) => (
                <button className="icone-btn" onClick={alternar} aria-expanded={aberto}
                  aria-label={avisos.length ? `Avisos: ${avisos.length}` : 'Avisos'}>
                  <IconeSino />
                  {avisos.length > 0 && <span className="ponto num">{avisos.length}</span>}
                </button>
              )}>
                <div className="menu-titulo">Avisos</div>
                {avisos.length === 0 && <div className="menu-vazio">Nada pendente por aqui.</div>}
                {avisos.map((a) => (
                  <button key={a.id} className="menu-item" role="menuitem" onClick={a.ir}>
                    <span><span>{a.titulo}</span><small>{a.sub}</small></span>
                  </button>
                ))}
              </MenuSuspenso>
            )}
            <MenuSuspenso botao={({ aberto, alternar }) => (
              <button className="conta-btn" onClick={alternar} aria-expanded={aberto} aria-label={`Conta de ${usuario.nome}`}>
                <span className="avatar forte">{iniciais(usuario.nome)}</span>
                <span className="conta-texto">
                  <span className="conta-nome" style={{ display: 'block' }}>{usuario.nome}</span>
                  <span className="conta-perfil">{ROTULO_PERFIL[usuario.perfil]}</span>
                </span>
                <IconeSetaBaixo tamanho={16} />
              </button>
            )}>
              <div className="menu-item estatico">
                <span><span>{usuario.nome}</span><small>{usuario.email}</small></span>
              </div>
              <button className="menu-item" role="menuitem" onClick={aoSair}><IconeSair tamanho={16} />Sair</button>
            </MenuSuspenso>
          </div>
        </header>

        <main className="conteudo">
          {aba === 'painel' && <Painel dados={dados} usuario={usuario} irPara={setAba} />}
          {aba === 'alunos' && <Alunos dados={dados} />}
          {aba === 'turmas' && <Turmas dados={dados} usuario={usuario} />}
          {aba === 'chamada' && <Chamada dados={dados} usuario={usuario} />}
          {aba === 'usuarios' && <Usuarios dados={dados} usuario={usuario} />}
          {aba === 'meus-alunos' && <MeusAlunos />}
        </main>
      </div>

      <nav className="nav-inferior" aria-label="Seções">
        {secoes.map((id) => {
          const { Icone, curto, rotulo } = SECOES[id];
          return (
            <button key={id} aria-current={aba === id ? 'page' : undefined} onClick={() => setAba(id)}>
              <Icone tamanho={20} />
              {curto || rotulo}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function temaInicial() {
  const salvo = lerPreferencia('tema', '');
  if (salvo === 'claro' || salvo === 'escuro') return salvo;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export default function App() {
  // undefined = conferindo o token guardado; null = sem login.
  const [usuario, setUsuario] = useState(() => (lerToken() ? undefined : null));
  const [aviso, setAviso] = useState('');
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => { document.documentElement.dataset.tema = tema; }, [tema]);
  const alternarTema = useCallback(() => setTema((t) => {
    const novo = t === 'escuro' ? 'claro' : 'escuro';
    guardarPreferencia('tema', novo);
    return novo;
  }), []);

  useEffect(() => {
    if (usuario !== undefined) return;
    let ativo = true;
    api.eu()
      .then((u) => { if (ativo) setUsuario(u); })
      .catch(() => { if (ativo) { limparToken(); setUsuario(null); } });
    return () => { ativo = false; };
  }, [usuario]);

  useEffect(() => {
    const expirou = () => {
      setUsuario((u) => {
        if (u) setAviso('Sua sessão expirou. Entre de novo para continuar.');
        return null;
      });
    };
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, expirou);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, expirou);
  }, []);

  const entrar = useCallback(({ token, usuario: u }, lembrar) => {
    guardarToken(token, lembrar);
    setAviso('');
    setUsuario(u);
  }, []);
  const sair = useCallback(() => {
    limparToken();
    setAviso('');
    setUsuario(null);
  }, []);

  return (
    <>
      {usuario === undefined && <div className="abrindo" role="status">Abrindo…</div>}
      {usuario === null && <Login aoEntrar={entrar} aviso={aviso} />}
      {/* key: ao trocar de conta, nada do usuário anterior fica na tela. */}
      {usuario && <AreaLogada key={usuario.id} usuario={usuario} aoSair={sair} tema={tema} alternarTema={alternarTema} />}
      <Toaster position="bottom-right" theme={tema === 'escuro' ? 'dark' : 'light'} toastOptions={{ style: { fontFamily: 'var(--font)' } }} />
    </>
  );
}
