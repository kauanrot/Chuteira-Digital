// Funções de apoio usadas pelas telas.

export function idade(dataNascimento) {
  if (!dataNascimento) return null;
  const n = new Date(dataNascimento);
  if (Number.isNaN(n.getTime())) return null;
  const h = new Date();
  let a = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--;
  return a;
}

export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function fmtData(iso) {
  if (!iso) return '—';
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export function fmtDataCurta(iso) {
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

export const hoje = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

// Cor fixa por categoria: a mesma em todas as telas.
const CORES = {
  'sub-7': '#0EA5A4',
  'sub-9': '#16A34A',
  'sub-11': '#7C3AED',
  'sub-13': '#0284C7',
  'sub-15': '#D97706',
  'sub-17': '#DC2626',
  feminino: '#DB2777',
};
export function corCategoria(categoria = '') {
  return CORES[categoria.trim().toLowerCase()] || '#71717A';
}

export const ROTULO_PERFIL = { ADMIN: 'Administrador', PROFESSOR: 'Professor', RESPONSAVEL: 'Responsável' };

export const normalizar = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function plural(n, um, varios) {
  return `${n} ${n === 1 ? um : varios}`;
}
