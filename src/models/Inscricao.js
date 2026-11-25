const sequelize = require('../config/database');

// Tabela que liga Usuário e Evento. O par (usuarioId, eventoId) é único:
// o aluno não consegue se inscrever duas vezes no mesmo evento.
const Inscricao = sequelize.define('Inscricao', {}, {
  tableName: 'inscricoes',
  indexes: [{ unique: true, fields: ['usuarioId', 'eventoId'] }]
});

module.exports = Inscricao;
