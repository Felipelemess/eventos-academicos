// Popula o banco com dados de exemplo, apenas se ainda não houver usuários.
// As senhas vêm do .env; os valores padrão servem só para desenvolvimento.
require('dotenv').config({ quiet: true });
const { sequelize, Usuario, Categoria, Evento, Inscricao } = require('./src/models');

async function popular() {
  if ((await Usuario.count()) > 0) return;

  const admin = await Usuario.create({
    nome: 'Administrador',
    email: (process.env.ADMIN_EMAIL || 'admin@eventos.com').toLowerCase(),
    senhaHash: await Usuario.gerarHash(process.env.ADMIN_SENHA || 'admin12345'),
    papel: 'admin'
  });
  const aluno = await Usuario.create({
    nome: 'Aluno Teste',
    email: (process.env.TESTE_EMAIL || 'aluno@eventos.com').toLowerCase(),
    senhaHash: await Usuario.gerarHash(process.env.TESTE_SENHA || 'aluno12345'),
    papel: 'aluno'
  });

  const [palestra, oficina, semana] = await Categoria.bulkCreate([
    { nome: 'Palestra' }, { nome: 'Oficina' }, { nome: 'Semana Acadêmica' }
  ]);

  const eventos = await Evento.bulkCreate([
    { titulo: 'Introdução ao Node.js', descricao: 'Primeiros passos com JavaScript no servidor.', data: '2026-12-03', local: 'Auditório 1', vagas: 80, categoriaId: palestra.id },
    { titulo: 'Oficina de Git e GitHub', descricao: 'Branch, commit, pull request e resolução de conflitos na prática.', data: '2026-12-05', local: 'Laboratório 3', vagas: 25, categoriaId: oficina.id },
    { titulo: 'Segurança em Aplicações Web', descricao: 'XSS, CSRF, SQL injection e como se proteger.', data: '2026-12-08', local: 'Auditório 2', vagas: 60, categoriaId: palestra.id },
    { titulo: 'Oficina de Banco de Dados com SQL', descricao: 'Modelagem, JOIN e consultas do dia a dia.', data: '2026-12-10', local: 'Laboratório 1', vagas: 30, categoriaId: oficina.id },
    { titulo: 'Semana de Tecnologia 2026', descricao: 'Abertura da semana com palestras e mostra de projetos.', data: '2026-12-14', local: 'Ginásio', vagas: 300, categoriaId: semana.id }
  ]);

  await Inscricao.create({ usuarioId: aluno.id, eventoId: eventos[0].id });
  console.log(`Dados de exemplo criados (admin: ${admin.email}, aluno: ${aluno.email}).`);
}

module.exports = popular;

// Permite rodar sozinho: npm run seed
if (require.main === module) {
  sequelize.sync().then(popular).then(() => sequelize.close());
}
