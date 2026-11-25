// Testes automatizados (npm test). Usam banco SQLite em memória, sem afetar dados reais.
process.env.DB_STORAGE = ':memory:';
process.env.NODE_ENV = 'test';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { sequelize, Usuario, Inscricao } = require('../src/models');
const popular = require('../seed');

before(async () => {
  await sequelize.sync({ force: true });
  await app.locals.sessionStore.sync();
  await popular();
});
after(() => sequelize.close());

// Faz login com um "agente" que guarda o cookie de sessão, como um navegador.
async function logar(email, senha) {
  const agente = request.agent(app);
  const pagina = await agente.get('/login');
  const token = pagina.text.match(/name="_csrf" value="([^"]+)"/)[1];
  await agente.post('/login').type('form').send({ _csrf: token, email, senha }).expect(302);
  const painel = await agente.get('/painel').expect(200);
  const csrf = painel.text.match(/name="csrf-token" content="([^"]+)"/)[1];
  return { agente, csrf };
}

test('rota protegida redireciona para o login quando não há sessão', async () => {
  const res = await request(app).get('/painel');
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/login');
});

test('busca AJAX retorna JSON filtrado pelo título', async () => {
  const res = await request(app).get('/api/eventos?q=oficina').expect(200);
  assert.match(res.headers['content-type'], /json/);
  assert.ok(res.body.length >= 1);
  assert.ok(res.body.every((e) => e.titulo.toLowerCase().includes('oficina')));
});

test('senha é salva como hash bcrypt, nunca em texto puro', async () => {
  const u = await Usuario.findOne({ where: { email: 'aluno@eventos.com' } });
  assert.notStrictEqual(u.senhaHash, 'aluno12345');
  assert.match(u.senhaHash, /^\$2[aby]\$/);
});

test('usuário não consegue cancelar a inscrição de outra pessoa (checagem do dono)', async () => {
  const doAluno = await Inscricao.findOne({ include: ['usuario'], where: { '$usuario.email$': 'aluno@eventos.com' } });
  const { agente, csrf } = await logar('admin@eventos.com', 'admin12345');
  const res = await agente.delete('/api/inscricoes/' + doAluno.id).set('X-CSRF-Token', csrf);
  assert.strictEqual(res.status, 404);
  assert.ok(await Inscricao.findByPk(doAluno.id), 'a inscrição do aluno continua existindo');
});

test('inscrição via AJAX funciona e exige token CSRF', async () => {
  const { agente, csrf } = await logar('aluno@eventos.com', 'aluno12345');
  await agente.post('/api/eventos/3/inscricao').expect(403); // sem token
  const res = await agente.post('/api/eventos/3/inscricao').set('X-CSRF-Token', csrf).expect(201);
  assert.strictEqual(res.body.ok, true);
});
