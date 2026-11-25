// Proteção CSRF simples (item 11 do checklist): cada sessão recebe um token,
// que vai em todo formulário (campo _csrf) e em todo fetch (cabeçalho X-CSRF-Token).
const crypto = require('crypto');

function csrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const enviado = (req.body && req.body._csrf) || req.get('X-CSRF-Token');
  if (enviado && enviado === req.session.csrfToken) return next();

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(403).json({ erro: 'Sessão expirada. Recarregue a página.' });
  }
  return res.status(403).render('erro', { titulo: 'Requisição recusada', mensagem: 'O formulário expirou. Volte e tente de novo.' });
}

module.exports = csrf;
