const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { authorize, authorizeSelfOrAdmin, rateLimitByUser } = require('../middleware/authorize');

// Get all users
router.get('/', optionalAuth, userController.getAllUsers);

// Create user (admin only)
router.post('/', authenticateToken, authorize('admin'), userController.createUser);

// Get user by ID
router.get('/:id', authenticateToken, authorizeSelfOrAdmin, userController.getUserById);

// Update user
router.put('/:id', authenticateToken, authorizeSelfOrAdmin, rateLimitByUser(10), userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorize('admin'), userController.deleteUser);

// Get user statistics (admin only)
router.get('/admin/stats', authenticateToken, authorize('admin'), userController.getUserStats);

module.exports = router;