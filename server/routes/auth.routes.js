const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// Public endpoints
router.get('/accounts', authController.getAccounts);
router.post('/auth/login', authController.login);

// Secure profile endpoint
router.get('/auth/me', authenticateToken, authController.getProfile);

module.exports = router;
