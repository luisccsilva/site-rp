const isValidUsername = (username) =>
  typeof username === 'string' && /^[a-zA-Z0-9_]{3,30}$/.test(username);

const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 6 && password.length <= 100;

const isValidAmount = (amount) => {
  const parsed = Number(amount);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 100000;
};

const isValidGameName = (name) => typeof name === 'string' && name.trim().length >= 3 && name.trim().length <= 120;

const isValidOdd = (odd) => {
  const parsed = Number(odd);
  return Number.isFinite(parsed) && parsed > 1 && parsed <= 1000;
};

module.exports = {
  isValidUsername,
  isValidPassword,
  isValidAmount,
  isValidGameName,
  isValidOdd
};
