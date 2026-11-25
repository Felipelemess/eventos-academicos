# Documento de Visão · Eventos Acadêmicos (C1)

**Problema:** as inscrições em palestras e oficinas da faculdade são feitas em listas de papel ou formulários soltos; ninguém sabe quantas vagas sobram e o aluno não tem onde ver em quais eventos está inscrito.

**Usuários:**
- **Aluno:** consulta eventos, se inscreve, cancela a inscrição e vê suas inscrições no painel.
- **Administrador (coordenação):** cadastra, edita e exclui eventos e categorias.

**Funcionalidade principal:** "Como aluno, quero me inscrever em um evento sem recarregar a página, para garantir a vaga rapidamente."

**Entidades e relações (1:N):**
- Categoria 1:N Evento
- Evento 1:N Inscrição
- Usuário 1:N Inscrição

**CRUD:** Eventos e Categorias (pelo administrador).

**Funções AJAX (fetch):**
1. Busca de eventos pelo título enquanto o usuário digita.
2. Inscrever-se e cancelar inscrição sem recarregar a página.

**Área restrita:** painel com as inscrições do aluno logado; páginas de cadastro só para administrador.

**Stack:** Node.js, Express, EJS, Sequelize, MySQL ou PostgreSQL.
