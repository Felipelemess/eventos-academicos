// Associações (relações 1:N):
//   Categoria 1:N Evento
//   Evento    1:N Inscricao
//   Usuario   1:N Inscricao
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Evento = require('./Evento');
const Inscricao = require('./Inscricao');

Categoria.hasMany(Evento, { foreignKey: { name: 'categoriaId', allowNull: false }, as: 'eventos', onDelete: 'RESTRICT' });
Evento.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

Evento.hasMany(Inscricao, { foreignKey: { name: 'eventoId', allowNull: false }, as: 'inscricoes', onDelete: 'CASCADE' });
Inscricao.belongsTo(Evento, { foreignKey: 'eventoId', as: 'evento' });

Usuario.hasMany(Inscricao, { foreignKey: { name: 'usuarioId', allowNull: false }, as: 'inscricoes', onDelete: 'CASCADE' });
Inscricao.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

module.exports = { sequelize, Usuario, Categoria, Evento, Inscricao };
