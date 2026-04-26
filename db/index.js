const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL nao definido. Configura no .env para correr localmente.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const query = (text, params = []) => pool.query(text, params);

const defaultGames = [
  ['Lobos FC vs Trovada United', 1.85],
  ['Porto Alto RP vs Bairro Oeste RP', 2.35],
  ['Guarda Sul RP vs Vila Nova RP', 1.6],
  ['Mercado Central RP vs Linha Norte RP', 3.1]
];

const seedGamesIfEmpty = async () => {
  const existingGames = await query('SELECT COUNT(*)::int AS count FROM games');

  if (existingGames.rows[0].count > 0) {
    return;
  }

  // Semear jogos iniciais para que o dashboard tenha sempre conteudo util apos o primeiro arranque.
  await Promise.all(
    defaultGames.map(([name, odd]) =>
      query('INSERT INTO games (name, odd) VALUES ($1, $2)', [name, odd])
    )
  );
};

const initDatabase = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(30) UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS bets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      game VARCHAR(120) NOT NULL,
      odd NUMERIC(6,2) NOT NULL,
      amount NUMERIC(10,2) NOT NULL CHECK (amount > 0)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      odd NUMERIC(6,2) NOT NULL CHECK (odd > 1)
    );
  `);

  await seedGamesIfEmpty();
};

module.exports = {
  pool,
  query,
  initDatabase
};
