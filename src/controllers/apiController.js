// Endpoints JSON usados pelas 2 funções AJAX (fetch) do front-end.
const { Op } = require('sequelize');
const { Evento, Categoria, Inscricao, sequelize } = require('../models');

// AJAX 1: busca de eventos enquanto o usuário digita.
exports.buscarEventos = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 60);
    const where = q ? { titulo: { [Op.like]: `%${q}%` } } : {}; // ORM gera consulta parametrizada (item 5)
    if (q && sequelize.getDialect() === 'postgres') where.titulo = { [Op.iLike]: `%${q}%` };
    const eventos = await Evento.findAll({
      where,
      include: [{ model: Categoria, as: 'categoria', attributes: ['nome'] }],
      order: [['data', 'ASC']],
      limit: 20
    });
    res.json(eventos.map((e) => ({
      id: e.id, titulo: e.titulo, data: e.data, local: e.local, categoria: e.categoria ? e.categoria.nome : ''
    })));
  } catch (err) { next(err); }
};

// AJAX 2a: inscrever-se num evento sem recarregar a página.
exports.inscrever = async (req, res, next) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });

    const ocupadas = await Inscricao.count({ where: { eventoId: evento.id } });
    if (ocupadas >= evento.vagas) return res.status(409).json({ erro: 'Não há mais vagas neste evento.' });

    const [inscricao, criada] = await Inscricao.findOrCreate({
      where: { usuarioId: req.session.usuario.id, eventoId: evento.id }
    });
    if (!criada) return res.status(409).json({ erro: 'Você já está inscrito neste evento.' });

    res.status(201).json({ ok: true, inscricaoId: inscricao.id, ocupadas: ocupadas + 1, vagas: evento.vagas });
  } catch (err) { next(err); }
};

// AJAX 2b: cancelar inscrição. Checagem do DONO (item 7 do checklist):
// a busca filtra pelo id da inscrição E pelo usuário logado; trocar o ID na URL não funciona.
exports.cancelar = async (req, res, next) => {
  try {
    const inscricao = await Inscricao.findOne({
      where: { id: req.params.id, usuarioId: req.session.usuario.id }
    });
    if (!inscricao) return res.status(404).json({ erro: 'Inscrição não encontrada.' });
    const eventoId = inscricao.eventoId;
    await inscricao.destroy();
    const evento = await Evento.findByPk(eventoId);
    const ocupadas = await Inscricao.count({ where: { eventoId } });
    res.json({ ok: true, eventoId, ocupadas, vagas: evento ? evento.vagas : 0 });
  } catch (err) { next(err); }
};
