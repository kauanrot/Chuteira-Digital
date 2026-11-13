import { useState } from 'react';
import { api, MODO_EXEMPLO } from '../api.js';
import { CONTAS_EXEMPLO, SENHA_EXEMPLO } from '../mock.js';
import { IconeCadeado, IconeEmail, IconeOlho, IconeOlhoFechado, Logo } from '../components/Icones.jsx';
import { ROTULO_PERFIL } from '../util.js';

export default function Login({ aoEntrar, aviso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  const entrar = async (e, credenciais) => {
    e?.preventDefault();
    const dados = credenciais || { email, senha };
    if (!dados.email.trim() || !dados.senha) {
      setErro('Informe o e-mail e a senha.');
      return;
    }
    setErro('');
    setEntrando(true);
    try {
      aoEntrar(await api.login(dados.email.trim(), dados.senha), lembrar);
    } catch (err) {
      setErro(err.message);
      setEntrando(false);
    }
  };

  return (
    <div className="login">
      <aside className="login-marca">
        <span className="login-logo"><Logo tamanho={56} /></span>
        <p className="login-nome">Chuteira Digital</p>
        <p className="login-frase">Gestão Completa da sua Escola de Futebol</p>
      </aside>

      <main className="login-area">
        <form className="login-form" onSubmit={entrar} noValidate>
          <h1>Acesse sua conta</h1>
          <p>Entre no Chuteira Digital</p>

          {aviso && !erro && <div className="login-aviso" role="status">{aviso}</div>}
          {erro && <div className="login-erro" role="alert">{erro}</div>}

          <div className="com-icone">
            <IconeEmail />
            <label className="sr-only" htmlFor="l-email">E-mail</label>
            <input id="l-email" className="entrada" type="email" autoComplete="username" autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
          </div>
          <div className="com-icone senha">
            <IconeCadeado />
            <label className="sr-only" htmlFor="l-senha">Senha</label>
            <input id="l-senha" className="entrada" type={mostrar ? 'text' : 'password'} autoComplete="current-password"
              value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" />
            <button type="button" className="senha-ver" onClick={() => setMostrar((m) => !m)}
              aria-pressed={mostrar} aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}>
              {mostrar ? <IconeOlhoFechado /> : <IconeOlho />}
            </button>
          </div>

          <label className="lembrar">
            <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
            Lembrar de mim
          </label>

          <button className="btn btn-primario btn-largo" type="submit" disabled={entrando}>
            {entrando ? 'Entrando…' : 'Entrar'}
          </button>

          {MODO_EXEMPLO && (
            <div className="login-exemplo">
              <span className="selo-prototipo">Dados de exemplo</span>
              <p className="muted">Entre como um dos perfis para ver o que cada um enxerga:</p>
              <div className="login-contas">
                {CONTAS_EXEMPLO.slice(0, 3).map((c) => (
                  <button key={c.id} type="button" className="btn btn-secundario btn-sm" disabled={entrando}
                    onClick={() => entrar(null, { email: c.email, senha: SENHA_EXEMPLO })}>
                    {ROTULO_PERFIL[c.perfil]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
