const isValidUsername = (username) =>
  typeof username === 'string' && /^[a-zA-Z0-9_]{3,30}$/.test(username);

const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 6 && password.length <= 100;

const isValidAmount = (amount) => {
  const parsed = Number(amount);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 100000;
};

module.exports = {
  isValidUsername,
  isValidPassword,
  isValidAmount
};
