const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

// Use routes
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/users', userRoutes);
router.use('/chat', chatRoutes); // New public chat API

module.exports = router;