const BaseService = require('./BaseService');
const Message = require('../models/Message');
const { NotFoundError, ValidationError } = require('../utils/errors');

class MessageService extends BaseService {
  constructor() {
    super(Message);
  }

  // Get messages with filtering and pagination
  async getMessages(filters = {}, options = {}) {
    const { limit = 50, page = 1, messageType, sender } = filters;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (messageType) {
      query.messageType = messageType;
    }
    
    if (sender) {
      query.sender = { $regex: sender, $options: 'i' }; // Case-insensitive search
    }
    
    const messages = await this.findAll(query, {
      limit: parseInt(limit),
      skip,
      sort: { timestamp: -1 } // Newest first
    });
    
    const total = await this.count(query);
    
    return {
      messages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: messages.length,
        totalMessages: total
      }
    };
  }

  // Create new message with validation
  async createMessage(messageData) {
    // Validate required fields
    if (!messageData.content || !messageData.sender) {
      throw new ValidationError('Content and sender are required');
    }

    // Set default values
    const data = {
      ...messageData,
      messageType: messageData.messageType || 'user',
      timestamp: messageData.timestamp || new Date()
    };

    return await this.create(data);
  }

  // Get message by ID
  async getMessageById(id) {
    const message = await this.findById(id);
    
    if (!message) {
      throw new NotFoundError('Message not found');
    }
    
    return message;
  }

  // Update message
  async updateMessage(id, updateData) {
    const message = await this.findById(id);
    
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Prevent updating certain fields
    const allowedUpdates = ['content', 'metadata'];
    const filteredData = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    return await this.updateById(id, filteredData);
  }

  // Delete message
  async deleteMessage(id) {
    const message = await this.findById(id);
    
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    await this.deleteById(id);
    return { message: 'Message deleted successfully' };
  }

  // Get messages by sender
  async getMessagesBySender(sender, options = {}) {
    const { limit = 50, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    const messages = await this.findAll(
      { sender },
      {
        limit: parseInt(limit),
        skip,
        sort: { timestamp: -1 }
      }
    );
    
    const total = await this.count({ sender });
    
    return {
      messages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: messages.length,
        totalMessages: total
      }
    };
  }

  // Get message statistics
  async getMessageStats() {
    const totalMessages = await this.count();
    const userMessages = await this.count({ messageType: 'user' });
    const botMessages = await this.count({ messageType: 'bot' });
    
    // Get messages from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentMessages = await this.count({
      timestamp: { $gte: yesterday }
    });
    
    return {
      total: totalMessages,
      userMessages,
      botMessages,
      recentMessages
    };
  }

  // Search messages by content
  async searchMessages(searchTerm, options = {}) {
    const { limit = 50, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    const query = {
      content: { $regex: searchTerm, $options: 'i' }
    };
    
    const messages = await this.findAll(query, {
      limit: parseInt(limit),
      skip,
      sort: { timestamp: -1 }
    });
    
    const total = await this.count(query);
    
    return {
      messages,
      searchTerm,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: messages.length,
        totalMessages: total
      }
    };
  }
}

module.exports = new MessageService();