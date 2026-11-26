# Checklist de Segurança · Auditoria (C6)

| # | Item | Teste feito pelo auditor | Resultado | Correção / onde está no código |
|---|------|-------------|-----------|---------------------|
| 1 | Senhas com bcrypt | Abrir a tabela `usuarios` | Passou: só hash `$2a$...` | `src/models/Usuario.js` |
| 2 | Sessão segura | Ver o cookie `sid` no navegador | Passou: HttpOnly, SameSite=Lax, Secure em produção; sessão regenerada no login | `src/app.js`, `authController.js` |
| 3 | Dados escapados (XSS) | Cadastrar evento com título `<script>alert(1)</script>` | Passou: aparece como texto | Views usam `<%= %>`; busca usa `textContent` |
| 4 | Validação de entrada | Enviar vagas = -5, data inválida, ID "abc" na URL | Passou: formulário volta com erro / 404 | `eventoController.js`, `router.param` |
| 5 | SQL injection | Buscar `' OR 1=1 --` | Passou: retorna vazio | Consultas pelo Sequelize (parametrizadas) |
| 6 | Rota protegida | Abrir `/painel` em aba anônima | Passou: redireciona ao login | `middlewares/auth.js` (exigirLogin) |
| 7 | Dono do recurso | Trocar o ID na URL de cancelar inscrição | Passou: 404, inscrição alheia intacta | `apiController.cancelar` filtra por `usuarioId` |
| 8 | Papéis (admin) | Aluno abre `/categorias` e `/eventos/novo` | Passou: 403 | `exigirAdmin`; cadastro público sempre cria "aluno" |
| 9 | Limite de login | 11 senhas erradas seguidas | Passou: bloqueia com 429 | `express-rate-limit` em `routes/index.js` |
| 10 | Segredos fora do Git | Procurar senha no histórico | Passou: só `.env.example` sem valores | `.gitignore` inclui `.env` |
| 11 | CSRF | POST sem o token | Passou: 403 | `middlewares/csrf.js` |
| 12 | Cabeçalhos HTTP | Ver resposta no DevTools | Passou: CSP, X-Frame-Options etc. | `helmet()` em `src/app.js` |
| 13 | Dependências sem falhas conhecidas | Rodar `npm audit` | Falhou: 3 vulnerabilidades moderadas (uuid) → corrigido | `overrides` no `package.json` |

Testes automatizados que cobrem os itens 1, 6, 7 e 11: `npm test`.

> Se o grupo encontrar falhas na auditoria, registre aqui o resultado "Falhou" e faça um commit para cada correção, por exemplo:
> `fix(seguranca): item 7 · cancelamento checa o dono`
