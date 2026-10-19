async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro na requisicao');
  return data;
}

export const api = {
  listarAlunos: () => req('GET', '/api/alunos'),
  criarAluno: (d) => req('POST', '/api/alunos', d),
  listarTurmas: () => req('GET', '/api/turmas'),
  criarTurma: (d) => req('POST', '/api/turmas', d),
  matricular: (turmaId, alunoId) => req('POST', `/api/turmas/${turmaId}/alunos`, { alunoId }),
  registrarChamada: (turmaId, d) => req('POST', `/api/turmas/${turmaId}/chamadas`, d),
  listarChamadas: (turmaId) => req('GET', `/api/turmas/${turmaId}/chamadas`),
};
