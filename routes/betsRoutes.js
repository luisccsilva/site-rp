const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { isValidAmount } = require('../middleware/validation');

const router = express.Router();

router.get('/api/games', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT id, name, odd FROM games ORDER BY id DESC');
    return res.json({ games: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao carregar jogos.' });
  }
});

router.post('/api/bets', requireAuth, async (req, res) => {
  const { game, odd, amount } = req.body;

  if (typeof game !== 'string' || !game.trim()) {
    return res.status(400).json({ error: 'Jogo invalido.' });
  }

  if (!isValidAmount(amount)) {
    return res.status(400).json({ error: 'Valor de aposta invalido.' });
  }

  try {
    const selectedGameResult = await query('SELECT id, name, odd FROM games WHERE name = $1 LIMIT 1', [
      game.trim()
    ]);

    if (!selectedGameResult.rows.length) {
      return res.status(400).json({ error: 'Jogo nao suportado.' });
    }

    const selectedGame = selectedGameResult.rows[0];
    const normalizedOdd = Number(odd);

    if (Number.isNaN(normalizedOdd) || normalizedOdd !== Number(selectedGame.odd)) {
      return res.status(400).json({ error: 'Odd invalida para este jogo.' });
    }

    await query('INSERT INTO bets (user_id, game, odd, amount) VALUES ($1, $2, $3, $4)', [
      req.session.user.id,
      selectedGame.name,
      Number(selectedGame.odd),
      Number(amount)
    ]);

    return res.status(201).json({ message: 'Aposta registada com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao guardar aposta.' });
  }
});

router.get('/api/my-bets', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, game, odd, amount FROM bets WHERE user_id = $1 ORDER BY id DESC',
      [req.session.user.id]
    );
    return res.json({ bets: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao carregar apostas.' });
  }
});

module.exports = router;
