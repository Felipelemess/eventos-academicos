const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { exigirLogin, exigirAdmin } = require('../middlewares/auth');
const auth = require('../controllers/authController');
const eventos = require('../controllers/eventoController');
const categorias = require('../controllers/categoriaController');
const painel = require('../controllers/painelController');
const api = require('../controllers/apiController');

// Limite de tentativas de login (item 9 do checklist): 10 a cada 15 min por IP.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).render('auth/login', {
    titulo: 'Entrar', email: '', erro: 'Muitas tentativas. Aguarde 15 minutos e tente de novo.'
  })
});

// IDs da URL precisam ser números inteiros positivos (validação de entrada).
router.param('id', (req, res, next, id) => {
  if (/^\d+$/.test(id)) return next();
  if (req.originalUrl.startsWith('/api/')) return res.status(400).json({ erro: 'ID inválido.' });
  return res.status(404).render('erro', { titulo: 'Não encontrado', mensagem: 'Endereço inválido.' });
});

router.get('/', (req, res) => res.redirect('/eventos'));

// Autenticação
router.get('/login', auth.formLogin);
router.post('/login', limiteLogin, auth.login);
router.get('/cadastro', auth.formCadastro);
router.post('/cadastro', auth.cadastro);
router.post('/logout', auth.logout);

// Área restrita
router.get('/painel', exigirLogin, painel.painel);

// Eventos: listar e ver são públicos; criar/editar/excluir só admin
router.get('/eventos', eventos.listar);
router.get('/eventos/novo', exigirLogin, exigirAdmin, eventos.formNovo);
router.post('/eventos', exigirLogin, exigirAdmin, eventos.criar);
router.get('/eventos/:id', eventos.detalhe);
router.get('/eventos/:id/editar', exigirLogin, exigirAdmin, eventos.formEditar);
router.post('/eventos/:id/editar', exigirLogin, exigirAdmin, eventos.atualizar);
router.post('/eventos/:id/excluir', exigirLogin, exigirAdmin, eventos.excluir);

// Categorias: CRUD só admin
router.get('/categorias', exigirLogin, exigirAdmin, categorias.listar);
router.get('/categorias/nova', exigirLogin, exigirAdmin, categorias.formNova);
router.post('/categorias', exigirLogin, exigirAdmin, categorias.criar);
router.get('/categorias/:id/editar', exigirLogin, exigirAdmin, categorias.formEditar);
router.post('/categorias/:id/editar', exigirLogin, exigirAdmin, categorias.atualizar);
router.post('/categorias/:id/excluir', exigirLogin, exigirAdmin, categorias.excluir);

// API JSON para as funções AJAX
router.get('/api/eventos', api.buscarEventos);
router.post('/api/eventos/:id/inscricao', exigirLogin, api.inscrever);
router.delete('/api/inscricoes/:id', exigirLogin, api.cancelar);

module.exports = router;
