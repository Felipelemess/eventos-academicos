const { Inscricao, Evento, Categoria } = require('../models');

// Área restrita: o aluno vê apenas as PRÓPRIAS inscrições.
exports.painel = async (req, res, next) => {
  try {
    const inscricoes = await Inscricao.findAll({
      where: { usuarioId: req.session.usuario.id },
      include: [{ model: Evento, as: 'evento', include: [{ model: Categoria, as: 'categoria' }] }],
      order: [[{ model: Evento, as: 'evento' }, 'data', 'ASC']]
    });
    res.render('painel/index', { titulo: 'Meu painel', inscricoes });
  } catch (err) { next(err); }
};
