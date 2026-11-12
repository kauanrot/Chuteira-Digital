/**
 * Freia tentativas de adivinhar senha: depois de `max` logins errados para o
 * mesmo e-mail vindos do mesmo IP, bloqueia por `janelaMs`. Em memoria, por
 * processo: suficiente para uma unica instancia da API.
 */
function limiteLogin({ max = 10, janelaMs = 15 * 60 * 1000 } = {}) {
  const falhas = new Map();

  return (req, res, next) => {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const chave = `${req.ip}|${email}`;
    const agora = Date.now();
    const atual = falhas.get(chave);
    if (atual && agora - atual.inicio > janelaMs) falhas.delete(chave);

    const registro = falhas.get(chave);
    if (registro && registro.total >= max) {
      const espera = Math.ceil((registro.inicio + janelaMs - agora) / 60000);
      return res.status(429).json({ erro: `Muitas tentativas. Tente de novo em ${espera} min.` });
    }

    res.on('finish', () => {
      if (res.statusCode === 401) {
        const r = falhas.get(chave) || { total: 0, inicio: Date.now() };
        r.total += 1;
        falhas.set(chave, r);
      } else if (res.statusCode < 400) {
        falhas.delete(chave);
      }
    });
    next();
  };
}

module.exports = limiteLogin;
