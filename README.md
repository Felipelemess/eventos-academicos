# Eventos Acadêmicos

Sistema web para divulgar palestras, oficinas e semanas acadêmicas da faculdade e controlar as inscrições dos alunos. Projeto Integrador de Programação Web.

**URL pública:** https://SEU-PROJETO.onrender.com  *(trocar depois do deploy)*

**Usuário de teste:** `aluno@eventos.com` · a senha foi enviada ao professor por mensagem.

## Funcionalidades

- Lista pública de eventos com categoria, data, local e vagas ocupadas.
- **AJAX 1:** busca de eventos pelo título enquanto o usuário digita (`fetch` em `/api/eventos?q=`).
- **AJAX 2:** inscrever-se e cancelar inscrição sem recarregar a página (`fetch` POST/DELETE).
- Cadastro, login, logout e área restrita ("Meu painel") com as inscrições do aluno.
- Administrador: CRUD completo de **Eventos** e **Categorias**.

## Tecnologias

Node.js 18+ · Express 5 · EJS (com layout) · Sequelize · MySQL ou PostgreSQL (produção no Render: PostgreSQL) · bcrypt · express-session · helmet · express-rate-limit

## Como rodar localmente

**Pré-requisitos:** [Node.js](https://nodejs.org) 18+ e um banco **PostgreSQL** ou **MySQL** vazio. Pode ser instalado no computador (pgAdmin, MySQL Workbench) ou gratuito na nuvem, sem instalar nada (ex.: [Neon](https://neon.tech), PostgreSQL).

1. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com/SEU-USUARIO/eventos-academicos.git
   cd eventos-academicos
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco. O assistente pede o endereço de conexão e cria o arquivo `.env`:
   ```bash
   npm run configurar
   ```
   Exemplos de endereço:
   ```
   postgres://postgres:SUA_SENHA@localhost:5432/eventos
   mysql://root:SUA_SENHA@localhost:3306/eventos
   postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require
   ```
4. Inicie:
   ```bash
   npm start
   ```
5. Abra http://localhost:3000. No primeiro start, o Sequelize cria as tabelas e popula o banco com eventos de exemplo, um administrador e um aluno de teste.

No Windows, os passos 2 a 4 podem ser feitos com dois cliques no arquivo `INICIAR.bat`.

Para rodar os testes: `npm test` (os testes usam um banco temporário em memória, para não apagar os dados reais).

## Variáveis de ambiente

| Variável | Para que serve |
|---|---|
| `PORT` | Porta do servidor (padrão 3000) |
| `SESSION_SECRET` | Chave que assina o cookie de sessão (obrigatória em produção) |
| `DATABASE_URL` | URL do MySQL (`mysql://...`) ou PostgreSQL (`postgres://...`) |
| `DB_SSL` | Opcional (`true`/`false`). Vazio = SSL ligado para banco na nuvem e desligado para banco local |
| `ADMIN_EMAIL` / `ADMIN_SENHA` | Administrador criado no primeiro start |
| `TESTE_EMAIL` / `TESTE_SENHA` | Aluno de teste criado no primeiro start |
| `NODE_ENV` | `production` no deploy |

## Estrutura (MVC)

```
├── server.js              # inicia o servidor, cria tabelas e dados de exemplo
├── seed.js                # dados de exemplo
├── configurar.js          # assistente que cria o .env (npm run configurar)
├── src/
│   ├── app.js             # configuração do Express, sessão, segurança
│   ├── config/database.js # conexão Sequelize
│   ├── models/            # Usuario, Categoria, Evento, Inscricao + associações
│   ├── controllers/       # regras de cada tela e da API
│   ├── routes/index.js    # todas as rotas
│   ├── middlewares/       # exigirLogin, exigirAdmin, csrf
│   └── views/             # EJS: layout, partials, páginas
├── public/                # CSS e JavaScript do navegador (funções AJAX)
├── tests/app.test.js      # testes automatizados
└── docs/                  # documento de visão e checklist de segurança
```

## Diagrama entidade-relacionamento (DER)

```mermaid
erDiagram
    CATEGORIA ||--o{ EVENTO : "possui"
    EVENTO ||--o{ INSCRICAO : "recebe"
    USUARIO ||--o{ INSCRICAO : "faz"
    CATEGORIA { int id PK  string nome }
    EVENTO { int id PK  string titulo  text descricao  date data  string local  int vagas  int categoriaId FK }
    USUARIO { int id PK  string nome  string email  string senhaHash  enum papel }
    INSCRICAO { int id PK  int usuarioId FK  int eventoId FK }
```

## Funções AJAX (C4)

*(Inserir aqui o print da aba Network do DevTools mostrando as requisições `fetch` para `/api/eventos?q=...` e `/api/eventos/:id/inscricao`.)*

Com o servidor desligado, as duas funções mostram a mensagem "Sem conexão com o servidor. Tente de novo." em vez de quebrar a página.

## Segurança

Checklist completo com os 12 itens auditados: [docs/checklist-seguranca.md](docs/checklist-seguranca.md)

## Testes

```bash
npm test
```

5 testes passando: rota protegida, busca AJAX, senha em hash, checagem do dono da inscrição e proteção CSRF.

## Equipe

| Integrante | Responsabilidades |
|---|---|
| Evelyn | Coordenação e documentação do projeto |
|Felipe | Banco de dados, DER e rotas do servidor |
| Breno | Interface do cliente, testes e segurança |

## Uso de IA e código de terceiros

Parte do código foi gerada com auxílio de IA (Claude, da Anthropic) e revisada pelo grupo. Bibliotecas de terceiros estão listadas no `package.json`.
