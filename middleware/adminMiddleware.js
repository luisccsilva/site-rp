const adminConfig = {
  username: process.env.ADMIN_USERNAME || 'galerinha',
  password: process.env.ADMIN_PASSWORD || 'arrozfrito'
};

// Guardamos o estado de admin numa chave propria da sessao para nao misturar com o login normal.
const isAdminAuthenticated = (req) => Boolean(req.session.admin && req.session.admin.authenticated);

const requireAdmin = (req, res, next) => {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Sessao de admin invalida.' });
  }

  return next();
};

const requireAdminPage = (req, res, next) => {
  if (!isAdminAuthenticated(req)) {
    return res.redirect('/login');
  }

  return next();
};

module.exports = {
  adminConfig,
  isAdminAuthenticated,
  requireAdmin,
  requireAdminPage
};
