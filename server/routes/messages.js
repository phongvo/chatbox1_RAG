const express = require('express');
const router = express.Router();
const { messageController } = require('../controllers');

// Get all messages
router.get('/', messageController.getMessages);

// Create message
router.post('/', messageController.createMessage);

// Get message by ID
router.get('/:id', messageController.getMessageById);

// Update message
router.put('/:id', messageController.updateMessage);

// Delete message
router.delete('/:id', messageController.deleteMessage);

// Search messages
router.get('/search/:term', messageController.searchMessages);

// Get messages by sender
router.get('/sender/:sender', messageController.getMessagesBySender);

// Get message statistics
router.get('/admin/stats', messageController.getMessageStats);

module.exports = router;