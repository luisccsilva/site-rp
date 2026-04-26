const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../db');
const { isValidUsername, isValidPassword } = require('../middleware/validation');

const router = express.Router();

router.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).json({
      error: 'Username invalido (3-30, letras/numeros/_) ou password fraca (min. 6 chars).'
    });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hash]
    );

    req.session.user = {
      id: result.rows[0].id,
      username: result.rows[0].username
    };

    return res.status(201).json({ message: 'Conta criada com sucesso.' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username ja existe.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no registo.' });
  }
});

router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).json({ error: 'Credenciais invalidas.' });
  }

  try {
    const result = await query('SELECT id, username, password FROM users WHERE username = $1', [
      username
    ]);

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Username ou password incorretos.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Username ou password incorretos.' });
    }

    req.session.user = { id: user.id, username: user.username };
    return res.json({ message: 'Login efetuado.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no login.' });
  }
});

router.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout efetuado.' });
  });
});

router.get('/api/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: req.session.user
  });
});

module.exports = router;
