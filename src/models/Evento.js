const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evento = sequelize.define('Evento', {
  titulo: { type: DataTypes.STRING(120), allowNull: false, validate: { len: [3, 120] } },
  descricao: { type: DataTypes.TEXT, allowNull: false },
  data: { type: DataTypes.DATEONLY, allowNull: false, validate: { isDate: true } },
  local: { type: DataTypes.STRING(120), allowNull: false },
  vagas: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5000 } }
}, { tableName: 'eventos' });

module.exports = Evento;
