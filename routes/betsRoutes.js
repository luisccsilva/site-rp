const express = require('express');
const { query } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { isValidAmount } = require('../middleware/validation');

const router = express.Router();

const games = [
  { game: 'Lobos FC vs Trovada United', odd: 1.85 },
  { game: 'Porto Alto RP vs Bairro Oeste RP', odd: 2.35 },
  { game: 'Guarda Sul RP vs Vila Nova RP', odd: 1.6 },
  { game: 'Mercado Central RP vs Linha Norte RP', odd: 3.1 }
];

router.get('/api/games', requireAuth, (req, res) => {
  res.json({ games });
});

router.post('/api/bets', requireAuth, async (req, res) => {
  const { game, odd, amount } = req.body;

  if (typeof game !== 'string' || !game.trim()) {
    return res.status(400).json({ error: 'Jogo invalido.' });
  }

  if (!isValidAmount(amount)) {
    return res.status(400).json({ error: 'Valor de aposta invalido.' });
  }

  const selectedGame = games.find((g) => g.game === game);
  if (!selectedGame) {
    return res.status(400).json({ error: 'Jogo nao suportado.' });
  }

  const normalizedOdd = Number(odd);
  if (Number.isNaN(normalizedOdd) || normalizedOdd !== selectedGame.odd) {
    return res.status(400).json({ error: 'Odd invalida para este jogo.' });
  }

  try {
    await query('INSERT INTO bets (user_id, game, odd, amount) VALUES ($1, $2, $3, $4)', [
      req.session.user.id,
      selectedGame.game,
      selectedGame.odd,
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
