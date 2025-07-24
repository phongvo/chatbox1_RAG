const express = require('express');
const router = express.Router();

// API Info
router.get('/', (req, res) => {
  res.json({
    message: 'Chatbox RAG API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      messages: '/api/messages',
      simple: '/api/simple'
    },
    documentation: '/api-docs'
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount route modules
router.use('/auth', require('./routes/auth'));
router.use('/messages', require('./routes/messages'));
router.use('/users', require('./routes/users'));
router.use('/simple', require('./routes/simple'));

// Catch-all for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

module.exports = router;