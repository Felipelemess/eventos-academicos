// Assistente de configuração: cria o arquivo .env perguntando só o endereço do banco.
// Uso: npm run configurar
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const arquivo = path.join(__dirname, '.env');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const perguntar = (texto) => new Promise((ok) => rl.question(texto, (r) => ok(r.trim())));

(async () => {
  console.log('\n=== Configuração do banco de dados (PostgreSQL ou MySQL) ===\n');
  console.log('Cole o endereço de conexão do seu banco. Exemplos:');
  console.log('  postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require');
  console.log('  postgres://postgres:SUA_SENHA@localhost:5432/eventos');
  console.log('  mysql://root:SUA_SENHA@localhost:3306/eventos\n');

  let url = '';
  while (!/^(postgres|postgresql|mysql):\/\//.test(url)) {
    url = await perguntar('Endereço do banco: ');
    if (!/^(postgres|postgresql|mysql):\/\//.test(url)) {
      console.log('  -> O endereço precisa começar com postgres://, postgresql:// ou mysql://\n');
    }
  }
  rl.close();

  const conteudo = [
    'PORT=3000',
    'SESSION_SECRET=' + crypto.randomBytes(32).toString('hex'),
    'DATABASE_URL=' + url,
    'ADMIN_EMAIL=admin@eventos.com',
    'ADMIN_SENHA=admin12345',
    'TESTE_EMAIL=aluno@eventos.com',
    'TESTE_SENHA=aluno12345',
    ''
  ].join('\n');

  fs.writeFileSync(arquivo, conteudo);
  console.log('\nPronto! Arquivo .env criado. Agora rode: npm start\n');
})();
