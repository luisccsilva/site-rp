const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Sessao invalida. Faz login novamente.' });
  }
  return next();
};

const requireGuestPage = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return next();
};

const requireAuthPage = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  return next();
};

module.exports = {
  requireAuth,
  requireGuestPage,
  requireAuthPage
};
