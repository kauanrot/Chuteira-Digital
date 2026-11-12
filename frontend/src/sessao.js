// Guarda o token do login no navegador. "Lembrar de mim" usa localStorage
// (continua logado ao reabrir o navegador); sem ele, sessionStorage (vale só
// para a aba). Tudo em try/catch: o armazenamento pode estar bloqueado.
const CHAVE = 'chuteira.token';

const ler = (onde) => { try { return onde.getItem(CHAVE); } catch { return null; } };

export function lerToken() {
  return ler(sessionStorage) || ler(localStorage);
}
export function guardarToken(token, lembrar = true) {
  limparToken();
  try { (lembrar ? localStorage : sessionStorage).setItem(CHAVE, token); } catch { /* segue só em memória */ }
}
export function limparToken() {
  try { localStorage.removeItem(CHAVE); } catch { /* nada a limpar */ }
  try { sessionStorage.removeItem(CHAVE); } catch { /* nada a limpar */ }
}

// Preferências de interface (tema, barra lateral): só conveniência do navegador.
export function lerPreferencia(chave, padrao) {
  try { return localStorage.getItem(`chuteira.${chave}`) ?? padrao; } catch { return padrao; }
}
export function guardarPreferencia(chave, valor) {
  try { localStorage.setItem(`chuteira.${chave}`, valor); } catch { /* sem persistência */ }
}

// Avisa o app quando a API recusa o token (expirado ou usuário removido).
export const EVENTO_SESSAO_EXPIRADA = 'chuteira:sessao-expirada';
export function avisarSessaoExpirada() {
  limparToken();
  window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
}
