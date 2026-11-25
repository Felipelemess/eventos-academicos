const { Categoria, Evento } = require('../models');

exports.listar = async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nome', 'ASC']], include: [{ model: Evento, as: 'eventos', attributes: ['id'] }] });
    res.render('categorias/index', { titulo: 'Categorias', categorias, erro: req.query.erro || null });
  } catch (err) { next(err); }
};

exports.formNova = (req, res) => {
  res.render('categorias/form', { titulo: 'Nova categoria', categoria: {}, erro: null });
};

exports.criar = async (req, res, next) => {
  const nome = String(req.body.nome || '').trim();
  try {
    await Categoria.create({ nome });
    res.redirect('/categorias');
  } catch (err) {
    if (err.name.startsWith('Sequelize') && err.name !== 'SequelizeDatabaseError') {
      return res.status(400).render('categorias/form', { titulo: 'Nova categoria', categoria: { nome }, erro: 'Nome inválido ou já existente.' });
    }
    next(err);
  }
};

exports.formEditar = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).render('erro', { titulo: 'Não encontrada', mensagem: 'Categoria não encontrada.' });
    res.render('categorias/form', { titulo: 'Editar categoria', categoria, erro: null });
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  const nome = String(req.body.nome || '').trim();
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).render('erro', { titulo: 'Não encontrada', mensagem: 'Categoria não encontrada.' });
    await categoria.update({ nome });
    res.redirect('/categorias');
  } catch (err) {
    if (err.name.startsWith('Sequelize') && err.name !== 'SequelizeDatabaseError') {
      return res.status(400).render('categorias/form', { titulo: 'Editar categoria', categoria: { id: req.params.id, nome }, erro: 'Nome inválido ou já existente.' });
    }
    next(err);
  }
};

exports.excluir = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.redirect('/categorias');
    const qtd = await Evento.count({ where: { categoriaId: categoria.id } });
    if (qtd > 0) return res.redirect('/categorias?erro=' + encodeURIComponent('Exclua ou mova os eventos desta categoria primeiro.'));
    await categoria.destroy();
    res.redirect('/categorias');
  } catch (err) { next(err); }
};
