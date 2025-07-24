const request = require('supertest');
const express = require('express');
const messageController = require('../../controllers/messageController');
const MessageService = require('../../services/MessageService');
const { createMessageData } = require('../fixtures/messages');

// Mock the MessageService
jest.mock('../../services/MessageService');

const app = express();
app.use(express.json());

// Setup routes for testing
app.get('/messages', messageController.getMessages);
app.post('/messages', messageController.createMessage);
app.get('/messages/:id', messageController.getMessageById);
app.put('/messages/:id', messageController.updateMessage);
app.delete('/messages/:id', messageController.deleteMessage);
app.get('/messages/search/:term', messageController.searchMessages);
app.get('/messages/sender/:sender', messageController.getMessagesBySender);
app.get('/messages/admin/stats', messageController.getMessageStats);

describe('MessageController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /messages', () => {
    it('should get messages successfully', async () => {
      const mockResult = {
        messages: [createMessageData()],
        pagination: {
          current: 1,
          total: 1,
          count: 1,
          totalMessages: 1
        }
      };
      MessageService.getMessages.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/messages')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(MessageService.getMessages).toHaveBeenCalledWith({});
    });

    it('should handle query parameters', async () => {
      const mockResult = { messages: [], pagination: {} };
      MessageService.getMessages.mockResolvedValue(mockResult);

      await request(app)
        .get('/messages?limit=10&page=2&messageType=user')
        .expect(200);

      expect(MessageService.getMessages).toHaveBeenCalledWith({
        limit: '10',
        page: '2',
        messageType: 'user'
      });
    });
  });

  describe('POST /messages', () => {
    it('should create message successfully', async () => {
      const messageData = createMessageData();
      const mockMessage = { _id: 'msg123', ...messageData };
      MessageService.createMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post('/messages')
        .send(messageData)
        .expect(201);

      expect(response.body).toEqual(mockMessage);
      expect(MessageService.createMessage).toHaveBeenCalledWith(messageData);
    });
  });

  describe('GET /messages/:id', () => {
    it('should get message by ID successfully', async () => {
      const mockMessage = { _id: 'msg123', ...createMessageData() };
      MessageService.getMessageById.mockResolvedValue(mockMessage);

      const response = await request(app)
        .get('/messages/msg123')
        .expect(200);

      expect(response.body).toEqual(mockMessage);
      expect(MessageService.getMessageById).toHaveBeenCalledWith('msg123');
    });
  });

  describe('PUT /messages/:id', () => {
    it('should update message successfully', async () => {
      const updateData = { content: 'Updated content' };
      const mockMessage = { _id: 'msg123', ...updateData };
      MessageService.updateMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .put('/messages/msg123')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockMessage);
      expect(MessageService.updateMessage).toHaveBeenCalledWith('msg123', updateData);
    });
  });

  describe('DELETE /messages/:id', () => {
    it('should delete message successfully', async () => {
      const mockResult = { message: 'Message deleted successfully' };
      MessageService.deleteMessage.mockResolvedValue(mockResult);

      const response = await request(app)
        .delete('/messages/msg123')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(MessageService.deleteMessage).toHaveBeenCalledWith('msg123');
    });
  });

  describe('GET /messages/search/:term', () => {
    it('should search messages successfully', async () => {
      const mockResult = {
        messages: [createMessageData()],
        searchTerm: 'test',
        pagination: { current: 1, total: 1, count: 1, totalMessages: 1 }
      };
      MessageService.searchMessages.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/messages/search/test')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(MessageService.searchMessages).toHaveBeenCalledWith('test', {});
    });
  });

  describe('GET /messages/sender/:sender', () => {
    it('should get messages by sender successfully', async () => {
      const mockResult = {
        messages: [createMessageData()],
        pagination: { current: 1, total: 1, count: 1, totalMessages: 1 }
      };
      MessageService.getMessagesBySender.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/messages/sender/testuser')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(MessageService.getMessagesBySender).toHaveBeenCalledWith('testuser', {});
    });
  });

  describe('GET /messages/admin/stats', () => {
    it('should get message statistics successfully', async () => {
      const mockStats = {
        total: 1000,
        userMessages: 600,
        botMessages: 400,
        recentMessages: 50
      };
      MessageService.getMessageStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/messages/admin/stats')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(MessageService.getMessageStats).toHaveBeenCalled();
    });
  });
});