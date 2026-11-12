import { mockApi } from './mock.js';
import { avisarSessaoExpirada, lerToken } from './sessao.js';

async function req(method, url, body) {
  const token = lerToken();
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível falar com o servidor. Confira se a API está no ar.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // 401 fora do login: o token venceu ou o usuário foi removido.
    if (res.status === 401 && !url.endsWith('/auth/login')) avisarSessaoExpirada();
    const erro = new Error(data.erro || 'Erro na requisição.');
    erro.status = res.status;
    throw erro;
  }
  return data;
}

const apiReal = {
  login: (email, senha) => req('POST', '/api/auth/login', { email, senha }),
  eu: () => req('GET', '/api/auth/me'),
  listarUsuarios: () => req('GET', '/api/usuarios'),
  criarUsuario: (d) => req('POST', '/api/usuarios', d),
  listarAlunos: () => req('GET', '/api/alunos'),
  criarAluno: (d) => req('POST', '/api/alunos', d),
  atualizarAluno: (id, d) => req('PUT', `/api/alunos/${id}`, d),
  listarTurmas: () => req('GET', '/api/turmas'),
  criarTurma: (d) => req('POST', '/api/turmas', d),
  definirProfessor: (turmaId, professorId) => req('PUT', `/api/turmas/${turmaId}/professor`, { professorId }),
  matricular: (turmaId, alunoId) => req('POST', `/api/turmas/${turmaId}/alunos`, { alunoId }),
  registrarChamada: (turmaId, d) => req('POST', `/api/turmas/${turmaId}/chamadas`, d),
  listarChamadas: (turmaId) => req('GET', `/api/turmas/${turmaId}/chamadas`),
  meusAlunos: () => req('GET', '/api/responsavel/alunos'),
};

// No protótipo visual (npm run dev:mock) o front usa dados de exemplo em memória.
export const MODO_EXEMPLO = import.meta.env.VITE_MOCK === 'true';
export const api = MODO_EXEMPLO ? mockApi : apiReal;
