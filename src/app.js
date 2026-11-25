require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const { sequelize } = require('./models');
const csrf = require('./middlewares/csrf');
const routes = require('./routes');

const app = express();
const producao = process.env.NODE_ENV === 'production';

// Atrás do proxy do Render/Railway, necessário para o cookie "secure" funcionar.
if (producao) app.set('trust proxy', 1);

// Cabeçalhos de segurança (item 12 do checklist).
app.use(helmet());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));

// Sessão guardada no próprio banco (funciona no deploy, sobrevive a reinícios).
const store = new SequelizeStore({ db: sequelize, tableName: 'sessoes' });
app.locals.sessionStore = store;

if (!process.env.SESSION_SECRET && producao) {
  throw new Error('Defina SESSION_SECRET nas variáveis de ambiente.');
}

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'segredo-apenas-para-desenvolvimento',
  store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,           // JavaScript da página não lê o cookie
    sameSite: 'lax',
    secure: producao,         // só via HTTPS em produção
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
}));

app.use(csrf);
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.caminho = req.path;
  next();
});

app.use(routes);

app.use((req, res) => {
  res.status(404).render('erro', { titulo: 'Página não encontrada', mensagem: 'O endereço que você abriu não existe.' });
});

// Erros: detalhes só no log do servidor, nunca para o usuário.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  if (req.originalUrl.startsWith('/api/')) return res.status(500).json({ erro: 'Erro interno. Tente de novo.' });
  res.status(500).render('erro', { titulo: 'Erro', mensagem: 'Algo deu errado. Tente de novo em instantes.' });
});

module.exports = app;
