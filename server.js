const path = require('path');
const express = require('express');
const session = require('express-session');
require('dotenv').config();

const { initDatabase } = require('./db');
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const betsRoutes = require('./routes/betsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET nao definido. Usa uma chave forte em producao.');
}

app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

app.use(pageRoutes);
app.use(authRoutes);
app.use(betsRoutes);

app.use((req, res) => {
  res.status(404).send('Pagina nao encontrada');
});

(async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor ativo em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar aplicacao:', error);
    process.exit(1);
  }
})();
