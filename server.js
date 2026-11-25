require('dotenv').config({ quiet: true });
if (!process.env.DATABASE_URL) {
  console.error('\nFalta configurar o banco de dados. Rode:  npm run configurar\n');
  process.exit(1);
}
const app = require('./src/app');
const { sequelize } = require('./src/models');
const popular = require('./seed');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();            // cria as tabelas, se ainda não existirem
    await app.locals.sessionStore.sync();
    await popular();                   // dados de exemplo só se o banco estiver vazio
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
  } catch (err) {
    console.error('Não foi possível iniciar:', err.message);
    process.exit(1);
  }
})();
