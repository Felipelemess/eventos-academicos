const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  nome: { type: DataTypes.STRING(100), allowNull: false, validate: { len: [2, 100] } },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  senhaHash: { type: DataTypes.STRING, allowNull: false },
  papel: { type: DataTypes.ENUM('aluno', 'admin'), allowNull: false, defaultValue: 'aluno' }
}, { tableName: 'usuarios' });

// Senha nunca é gravada em texto puro (item 1 do checklist).
Usuario.prototype.conferirSenha = function (senha) {
  return bcrypt.compare(senha, this.senhaHash);
};
Usuario.gerarHash = (senha) => bcrypt.hash(senha, 10);

module.exports = Usuario;
