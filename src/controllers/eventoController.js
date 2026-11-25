const { Evento, Categoria, Inscricao } = require('../models');

// Lê e valida os campos do formulário (item 4 do checklist: validação de entrada).
function lerCampos(body) {
  return {
    titulo: String(body.titulo || '').trim(),
    descricao: String(body.descricao || '').trim(),
    data: String(body.data || '').trim(),
    local: String(body.local || '').trim(),
    vagas: parseInt(body.vagas, 10),
    categoriaId: parseInt(body.categoriaId, 10)
  };
}

async function renderForm(res, titulo, evento, erro, status = 200) {
  const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
  res.status(status).render('eventos/form', { titulo, evento, categorias, erro });
}

// Página pública: lista de eventos com o nome da categoria (JOIN pela relação 1:N).
exports.listar = async (req, res, next) => {
  try {
    const eventos = await Evento.findAll({
      include: [{ model: Categoria, as: 'categoria' }, { model: Inscricao, as: 'inscricoes', attributes: ['id', 'usuarioId'] }],
      order: [['data', 'ASC']]
    });
    const usuarioId = req.session.usuario && req.session.usuario.id;
    const lista = eventos.map((e) => {
      const minha = usuarioId ? e.inscricoes.find((i) => i.usuarioId === usuarioId) : null;
      return { ...e.toJSON(), ocupadas: e.inscricoes.length, minhaInscricaoId: minha ? minha.id : null };
    });
    res.render('eventos/index', { titulo: 'Eventos', eventos: lista });
  } catch (err) { next(err); }
};

exports.detalhe = async (req, res, next) => {
  try {
    const evento = await Evento.findByPk(req.params.id, {
      include: [{ model: Categoria, as: 'categoria' }, { model: Inscricao, as: 'inscricoes', attributes: ['id', 'usuarioId'] }]
    });
    if (!evento) return res.status(404).render('erro', { titulo: 'Não encontrado', mensagem: 'Evento não encontrado.' });
    const usuarioId = req.session.usuario && req.session.usuario.id;
    const minha = usuarioId ? evento.inscricoes.find((i) => i.usuarioId === usuarioId) : null;
    res.render('eventos/detalhe', {
      titulo: evento.titulo,
      evento: { ...evento.toJSON(), ocupadas: evento.inscricoes.length, minhaInscricaoId: minha ? minha.id : null }
    });
  } catch (err) { next(err); }
};

exports.formNovo = async (req, res, next) => {
  try { await renderForm(res, 'Novo evento', {}, null); } catch (err) { next(err); }
};

exports.criar = async (req, res, next) => {
  const campos = lerCampos(req.body);
  try {
    if (!(await Categoria.findByPk(campos.categoriaId))) {
      return renderForm(res, 'Novo evento', campos, 'Escolha uma categoria válida.', 400);
    }
    await Evento.create(campos);
    res.redirect('/eventos');
  } catch (err) {
    if (err.name === 'SequelizeValidationError') return renderForm(res, 'Novo evento', campos, 'Confira os campos: ' + err.errors.map((e) => e.path).join(', '), 400);
    next(err);
  }
};

exports.formEditar = async (req, res, next) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).render('erro', { titulo: 'Não encontrado', mensagem: 'Evento não encontrado.' });
    await renderForm(res, 'Editar evento', evento, null);
  } catch (err) { next(err); }
};

exports.atualizar = async (req, res, next) => {
  const campos = lerCampos(req.body);
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).render('erro', { titulo: 'Não encontrado', mensagem: 'Evento não encontrado.' });
    if (!(await Categoria.findByPk(campos.categoriaId))) {
      return renderForm(res, 'Editar evento', { ...campos, id: evento.id }, 'Escolha uma categoria válida.', 400);
    }
    await evento.update(campos);
    res.redirect('/eventos/' + evento.id);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') return renderForm(res, 'Editar evento', { ...campos, id: req.params.id }, 'Confira os campos: ' + err.errors.map((e) => e.path).join(', '), 400);
    next(err);
  }
};

exports.excluir = async (req, res, next) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (evento) await evento.destroy();
    res.redirect('/eventos');
  } catch (err) { next(err); }
};
