# RP Bets (Roleplay, Sem Dinheiro Real)

Website de apostas ficticias para roleplay, feito com Node.js + Express + PostgreSQL e preparado para deploy no Render.

## Funcionalidades

- Registo e login com `username` e `password`
- Password com hash via `bcrypt`
- Sessao com `express-session`
- Logout
- Rotas privadas protegidas por middleware
- Bloqueio de acesso direto a `/dashboard` e `/my-bets` sem login
- Validacao de inputs no backend
- Lista de jogos mockados com odds
- Criacao de apostas e armazenamento no PostgreSQL
- Historico de apostas do utilizador

## Estrutura

- `server.js`
- `routes/`
- `middleware/`
- `db/`
- `public/`
- `views/`
- `render.yaml`

## Requisitos

- Node.js 18+
- PostgreSQL

## Variaveis de ambiente

Cria um ficheiro `.env` com base no `.env.example`:

- `PORT=3000`
- `DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME`
- `SESSION_SECRET=uma_chave_muito_forte`
- `NODE_ENV=development`
- `ADMIN_USERNAME=galerinha`
- `ADMIN_PASSWORD=arrozfrito`

## Como correr localmente

```bash
npm install
npm start
```

Abre no browser:

- `http://localhost:3000/login`

## Base de dados

As tabelas sao criadas automaticamente no arranque (`users`, `bets` e `games`).

Schema equivalente em `db/schema.sql`:

- `users (id, username, password)`
- `bets (id, user_id, game, odd, amount)`
- `games (id, name, odd)`

## Admin

- Painel em `/admin`
- Login admin separado do sistema de utilizadores normal
- Credenciais por omissao:
- `username: galerinha`
- `password: arrozfrito`
- O codigo ja aceita trocar isto no futuro via `ADMIN_USERNAME` e `ADMIN_PASSWORD`

## Deploy no Render

### Opcao A - Blueprint (`render.yaml`)

1. Fazer push do projeto para GitHub.
2. No Render: `New` -> `Blueprint`.
3. Selecionar o repositorio.
4. O Render cria:
- Web Service Node
- PostgreSQL
- `DATABASE_URL` ligada automaticamente
5. Confirmar deploy.

### Opcao B - Manual

1. Criar uma PostgreSQL no Render:
- `New` -> `PostgreSQL`
2. Criar um Web Service:
- `New` -> `Web Service`
- Build Command: `npm install`
- Start Command: `npm start`
3. Em `Environment`, definir:
- `DATABASE_URL` com a connection string da DB
- `SESSION_SECRET` com valor forte
- `NODE_ENV=production`
4. Fazer deploy.

## Notas de seguranca

- Projeto para roleplay, sem pagamentos reais.
- Usa sempre `SESSION_SECRET` forte em producao.
- Em producao no Render, o cookie de sessao usa `secure=true`.
