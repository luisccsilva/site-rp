const path = require('path');
const express = require('express');
const { requireGuestPage, requireAuthPage } = require('../middleware/auth');

const router = express.Router();
const viewsPath = path.join(__dirname, '..', 'views');

router.get('/login', requireGuestPage, (req, res) => {
  res.sendFile(path.join(viewsPath, 'login.html'));
});

router.get('/register', requireGuestPage, (req, res) => {
  res.sendFile(path.join(viewsPath, 'register.html'));
});

router.get('/dashboard', requireAuthPage, (req, res) => {
  res.sendFile(path.join(viewsPath, 'dashboard.html'));
});

router.get('/my-bets', requireAuthPage, (req, res) => {
  res.sendFile(path.join(viewsPath, 'my-bets.html'));
});

module.exports = router;
