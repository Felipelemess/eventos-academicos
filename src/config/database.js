// Conexão com o banco via Sequelize (ORM).
// O sistema usa PostgreSQL ou MySQL, informado na variável DATABASE_URL (arquivo .env):
//   postgres://usuario:senha@servidor:5432/banco
//   mysql://usuario:senha@servidor:3306/banco
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // Somente os testes automatizados (npm test) usam um banco temporário em memória,
  // para nunca apagar os dados reais do sistema.
  sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
} else {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL não definida. Rode "npm run configurar" ou preencha o arquivo .env.');
  }
  const endereco = new URL(url);
  const dialect = endereco.protocol.startsWith('mysql') ? 'mysql' : 'postgres';
  const local = ['localhost', '127.0.0.1'].includes(endereco.hostname) || !endereco.hostname.includes('.');

  // SSL: obrigatório em bancos na nuvem (Neon, Render externo etc.), desligado em banco local.
  const usarSSL = process.env.DB_SSL ? process.env.DB_SSL === 'true' : !local;

  // Os parâmetros extras da URL (?sslmode=...) são tratados aqui, pela opção de SSL.
  sequelize = new Sequelize(url.split('?')[0], {
    dialect,
    logging: false,
    dialectOptions: usarSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {}
  });
}

module.exports = sequelize;
