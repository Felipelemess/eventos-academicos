const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  nome: { type: DataTypes.STRING(60), allowNull: false, unique: true, validate: { len: [2, 60] } }
}, { tableName: 'categorias' });

module.exports = Categoria;
