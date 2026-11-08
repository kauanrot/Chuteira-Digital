// No banco os ids sao Int (autoincrement); na API e no dominio continuam
// strings, como nos repositorios em memoria.
const MAX_INT4 = 2147483647;

/** Converte um id vindo da API para Int, ou null se nao for um id valido. */
function paraIdBanco(id) {
  if (id === null || id === undefined || !/^\d+$/.test(String(id))) return null;
  const n = Number(id);
  return n > 0 && n <= MAX_INT4 ? n : null;
}

const paraIdDominio = (id) => String(id);

/** "AAAA-MM-DD" <-> Date (colunas @db.Date, sempre em UTC). */
const paraDataBanco = (iso) => new Date(`${iso}T00:00:00.000Z`);
const paraDataDominio = (d) => d.toISOString().slice(0, 10);

const ouUndefined = (v) => (v === null ? undefined : v);

module.exports = { paraIdBanco, paraIdDominio, paraDataBanco, paraDataDominio, ouUndefined };
