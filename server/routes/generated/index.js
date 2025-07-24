// Auto-generated routes index
// Generated on: 2025-07-24T15:59:20.353Z

const express = require('express');
const router = express.Router();

// Import generated route modules
const apiRoutes = require('./api.generated');
const healthRoutes = require('./health.generated');
const messagesRoutes = require('./messages.generated');
const usersRoutes = require('./users.generated');

// Mount generated routes
router.use('/api', apiRoutes);
router.use('/health', healthRoutes);
router.use('/messages', messagesRoutes);
router.use('/users', usersRoutes);

// List all available generated endpoints
router.get('/', (req, res) => {
  res.json({
    message: 'Auto-generated API endpoints',
    endpoints: {
      api: '/api/generated/api',
      health: '/api/generated/health',
      messages: '/api/generated/messages',
      users: '/api/generated/users'
    },
    generatedAt: '2025-07-24T15:59:20.353Z'
  });
});

module.exports = router;
