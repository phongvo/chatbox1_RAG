const { MessageService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

class MessageController {
  // Get all messages
  getMessages = asyncHandler(async (req, res) => {
    const result = await MessageService.getMessages(req.query);
    res.json(result);
  });

  // Create message
  createMessage = asyncHandler(async (req, res) => {
    const message = await MessageService.createMessage(req.body);
    res.status(201).json(message);
  });

  // Get message by ID
  getMessageById = asyncHandler(async (req, res) => {
    const message = await MessageService.getMessageById(req.params.id);
    res.json(message);
  });

  // Update message
  updateMessage = asyncHandler(async (req, res) => {
    const message = await MessageService.updateMessage(req.params.id, req.body);
    res.json(message);
  });

  // Delete message
  deleteMessage = asyncHandler(async (req, res) => {
    const result = await MessageService.deleteMessage(req.params.id);
    res.json(result);
  });

  // Search messages
  searchMessages = asyncHandler(async (req, res) => {
    const result = await MessageService.searchMessages(req.params.term, req.query);
    res.json(result);
  });

  // Get messages by sender
  getMessagesBySender = asyncHandler(async (req, res) => {
    const result = await MessageService.getMessagesBySender(req.params.sender, req.query);
    res.json(result);
  });

  // Get message statistics
  getMessageStats = asyncHandler(async (req, res) => {
    const stats = await MessageService.getMessageStats();
    res.json(stats);
  });
}

module.exports = new MessageController();