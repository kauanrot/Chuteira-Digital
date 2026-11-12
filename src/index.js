require('dotenv').config({ quiet: true });
const createApp = require('./app');
const { criarRepositoriosMemoria, criarRepositoriosPrisma } = require('./repositories');

const PORT = process.env.PORT || 3000;

// Com DATABASE_URL usa o PostgreSQL (Prisma); sem ela, cai para memoria (dados se perdem ao reiniciar).
const usarBanco = Boolean(process.env.DATABASE_URL);
const repos = usarBanco ? criarRepositoriosPrisma() : criarRepositoriosMemoria();

async function iniciar() {
  const app = createApp(repos);

  // Primeiro acesso: cria o administrador a partir do .env quando nao ha usuarios.
  const admin = await app.locals.authService.garantirAdminInicial({
    nome: process.env.ADMIN_NOME,
    email: process.env.ADMIN_EMAIL,
    senha: process.env.ADMIN_SENHA,
  });
  if (admin) {
    console.log(`Administrador inicial criado: ${admin.email}`);
  } else if ((await repos.usuarioRepo.contar()) === 0) {
    console.warn('Nenhum usuario cadastrado. Defina ADMIN_EMAIL e ADMIN_SENHA no .env e reinicie para criar o administrador.');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET nao definido: usando um segredo temporario (os logins caem ao reiniciar).');
  }

  app.listen(PORT, () => {
    console.log(`Chuteira Digital API rodando em http://localhost:${PORT}`);
    console.log(usarBanco
      ? 'Persistencia: PostgreSQL (Prisma)'
      : 'Persistencia: memoria (defina DATABASE_URL no .env para usar o PostgreSQL)');
  });
}

iniciar().catch((e) => {
  console.error('Falha ao iniciar a API:', e.message);
  process.exit(1);
});
