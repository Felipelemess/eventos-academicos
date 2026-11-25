const { Usuario } = require('../models');

exports.formLogin = (req, res) => {
  if (req.session.usuario) return res.redirect('/painel');
  res.render('auth/login', { titulo: 'Entrar', erro: null, email: '' });
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');
    const usuario = await Usuario.findOne({ where: { email } });

    // Mensagem genérica: não revela se o e-mail existe.
    if (!usuario || !(await usuario.conferirSenha(senha))) {
      return res.status(401).render('auth/login', { titulo: 'Entrar', erro: 'E-mail ou senha inválidos.', email });
    }

    const destino = req.session.voltarPara || '/painel';
    // Nova sessão a cada login, contra fixação de sessão (item 2 do checklist).
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.usuario = { id: usuario.id, nome: usuario.nome, papel: usuario.papel };
      req.session.save(() => res.redirect(destino));
    });
  } catch (err) { next(err); }
};

exports.formCadastro = (req, res) => {
  res.render('auth/cadastro', { titulo: 'Criar conta', erro: null, dados: {} });
};

exports.cadastro = async (req, res, next) => {
  const dados = {
    nome: String(req.body.nome || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase()
  };
  const senha = String(req.body.senha || '');
  try {
    if (senha.length < 8) {
      return res.status(400).render('auth/cadastro', { titulo: 'Criar conta', erro: 'A senha precisa ter pelo menos 8 caracteres.', dados });
    }
    if (await Usuario.findOne({ where: { email: dados.email } })) {
      return res.status(400).render('auth/cadastro', { titulo: 'Criar conta', erro: 'Este e-mail já está cadastrado.', dados });
    }
    // Todo cadastro público é "aluno"; o papel nunca vem do formulário.
    const usuario = await Usuario.create({ ...dados, senhaHash: await Usuario.gerarHash(senha), papel: 'aluno' });
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.usuario = { id: usuario.id, nome: usuario.nome, papel: usuario.papel };
      req.session.save(() => res.redirect('/painel'));
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).render('auth/cadastro', { titulo: 'Criar conta', erro: 'Confira nome e e-mail.', dados });
    }
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/login');
  });
};
