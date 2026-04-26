const path = require('path');
const express = require('express');
const { query } = require('../db');
const { adminConfig, requireAdmin, requireAdminPage } = require('../middleware/adminMiddleware');
const { isValidGameName, isValidOdd } = require('../middleware/validation');

const router = express.Router();
const viewsPath = path.join(__dirname, '..', 'views');
const validStatuses = new Set(['pending', 'completed', 'cancelled']);

router.get('/admin', requireAdminPage, (req, res) => {
  res.sendFile(path.join(viewsPath, 'admin.html'));
});

router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  // Mantemos credenciais fixas por agora, mas a origem ja aceita override por variaveis de ambiente.
  if (username !== adminConfig.username || password !== adminConfig.password) {
    return res.status(401).json({ error: 'Credenciais de admin invalidas.' });
  }

  req.session.admin = {
    authenticated: true,
    username: adminConfig.username
  };

  return req.session.save((error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao guardar sessao de admin.' });
    }

    return res.json({ message: 'Login de admin efetuado.' });
  });
});

router.get('/admin/session', (req, res) => {
  if (!req.session.admin || !req.session.admin.authenticated) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    admin: { username: req.session.admin.username }
  });
});

router.get('/admin/games', requireAdmin, async (req, res) => {
  try {
    const result = await query('SELECT id, name, odd FROM games ORDER BY id DESC');
    return res.json({ games: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao carregar jogos do admin.' });
  }
});

router.post('/admin/games', requireAdmin, async (req, res) => {
  const { name, odd } = req.body;

  if (!isValidGameName(name)) {
    return res.status(400).json({ error: 'Nome de jogo invalido.' });
  }

  if (!isValidOdd(odd)) {
    return res.status(400).json({ error: 'Odd invalida.' });
  }

  try {
    await query('INSERT INTO games (name, odd) VALUES ($1, $2)', [name.trim(), Number(odd)]);
    return res.status(201).json({ message: 'Jogo criado com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar jogo.' });
  }
});

router.post('/admin/games/delete/:id', requireAdmin, async (req, res) => {
  const gameId = Number(req.params.id);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    return res.status(400).json({ error: 'ID de jogo invalido.' });
  }

  try {
    const result = await query('DELETE FROM games WHERE id = $1', [gameId]);

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Jogo nao encontrado.' });
    }

    return res.json({ message: 'Jogo apagado com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao apagar jogo.' });
  }
});

router.get('/admin/bets', requireAdmin, async (req, res) => {
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
  const usernameFilter =
    typeof req.query.username === 'string' ? req.query.username.trim().toLowerCase() : '';

  if (statusFilter && !validStatuses.has(statusFilter)) {
    return res.status(400).json({ error: 'Filtro de estado invalido.' });
  }

  try {
    const conditions = [];
    const values = [];

    if (statusFilter) {
      values.push(statusFilter);
      conditions.push(`bets.status = $${values.length}`);
    }

    if (usernameFilter) {
      values.push(`%${usernameFilter}%`);
      conditions.push(`LOWER(users.username) LIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // O JOIN expande apenas o username do utilizador, sem expor qualquer password.
    const result = await query(
      `SELECT bets.id, users.username, bets.game, bets.odd, bets.status
       FROM bets
       INNER JOIN users ON users.id = bets.user_id
       ${whereClause}
       ORDER BY bets.id DESC`
      ,
      values
    );

    return res.json({ bets: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao carregar apostas dos utilizadores.' });
  }
});

router.post('/admin/bets/:id/status', requireAdmin, async (req, res) => {
  const betId = Number(req.params.id);
  const status = typeof req.body.status === 'string' ? req.body.status.trim().toLowerCase() : '';

  if (!Number.isInteger(betId) || betId <= 0) {
    return res.status(400).json({ error: 'ID de aposta invalido.' });
  }

  if (!validStatuses.has(status) || status === 'pending') {
    return res.status(400).json({ error: 'Estado invalido para atualizacao.' });
  }

  try {
    const result = await query('UPDATE bets SET status = $1 WHERE id = $2', [status, betId]);

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Aposta nao encontrada.' });
    }

    return res.json({ message: 'Estado da aposta atualizado com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar estado da aposta.' });
  }
});

module.exports = router;
