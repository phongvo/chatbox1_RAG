const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticateToken } = require('../middleware/auth');
const { rateLimitByUser } = require('../middleware/authorize');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Change password
router.post('/change-password', authenticateToken, rateLimitByUser(5), authController.changePassword);

module.exports = router;