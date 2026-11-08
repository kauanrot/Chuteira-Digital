require('dotenv').config({ quiet: true });
const createApp = require('./app');
const { criarRepositoriosMemoria, criarRepositoriosPrisma } = require('./repositories');

const PORT = process.env.PORT || 3000;

// Com DATABASE_URL usa o PostgreSQL (Prisma); sem ela, cai para memoria (dados se perdem ao reiniciar).
const usarBanco = Boolean(process.env.DATABASE_URL);
const repos = usarBanco ? criarRepositoriosPrisma() : criarRepositoriosMemoria();

createApp(repos).listen(PORT, () => {
  console.log(`Chuteira Digital API rodando em http://localhost:${PORT}`);
  console.log(usarBanco
    ? 'Persistencia: PostgreSQL (Prisma)'
    : 'Persistencia: memoria (defina DATABASE_URL no .env para usar o PostgreSQL)');
});
