// Rota protegida: sem sessão, vai para o login (item 6 do checklist).
function exigirLogin(req, res, next) {
  if (req.session.usuario) return next();
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  req.session.voltarPara = req.originalUrl;
  return res.redirect('/login');
}

// Só administrador cadastra, edita e exclui (item 8 do checklist).
function exigirAdmin(req, res, next) {
  if (req.session.usuario && req.session.usuario.papel === 'admin') return next();
  return res.status(403).render('erro', { titulo: 'Acesso negado', mensagem: 'Somente administradores podem acessar esta página.' });
}

module.exports = { exigirLogin, exigirAdmin };
