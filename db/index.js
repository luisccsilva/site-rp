const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL nao definido. Configura no .env para correr localmente.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const query = (text, params = []) => pool.query(text, params);

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
};

module.exports = {
  pool,
  query,
  initDatabase
};
