const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public chat endpoints (no authentication required)

// Send single chat message
router.post('/message', chatController.sendChatMessage);

// Send streaming chat message
router.post('/message/stream', chatController.sendStreamingChatMessage);

// Send multi-turn conversation
router.post('/conversation', chatController.sendConversation);

// Get available models
router.get('/models', chatController.getAvailableModels);

// Test LMStudio connection
router.get('/status', chatController.testConnection);

// Embedding endpoints
router.post('/embeddings', chatController.createEmbedding);
router.post('/embeddings/search', chatController.searchSimilar);

// Add file upload endpoint
router.post('/embeddings/upload', upload.single('file'), chatController.uploadDocument);

module.exports = router;