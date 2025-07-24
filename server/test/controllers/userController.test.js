const request = require('supertest');
const express = require('express');
const userController = require('../../controllers/userController');
const UserService = require('../../services/UserService');
const { createUserData } = require('../fixtures/users');

// Mock the UserService
jest.mock('../../services/UserService');

const app = express();
app.use(express.json());

// Setup middleware to simulate authenticated user
const mockAuthMiddleware = (role = 'user') => (req, res, next) => {
  req.user = {
    _id: 'user123',
    username: 'testuser',
    role: role
  };
  next();
};

// Setup routes for testing
app.get('/users', mockAuthMiddleware(), userController.getAllUsers);
app.post('/users', mockAuthMiddleware('admin'), userController.createUser);
app.get('/users/:id', mockAuthMiddleware(), userController.getUserById);
app.put('/users/:id', mockAuthMiddleware(), userController.updateUser);
app.delete('/users/:id', mockAuthMiddleware('admin'), userController.deleteUser);
app.get('/users/admin/stats', mockAuthMiddleware('admin'), userController.getUserStats);

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [createUserData(), createUserData({ username: 'user2' })];
      UserService.getAllUsers.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(UserService.getAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'user123' }),
        {}
      );
    });

    it('should handle query parameters', async () => {
      const mockUsers = [createUserData()];
      UserService.getAllUsers.mockResolvedValue(mockUsers);

      await request(app)
        .get('/users?isActive=true')
        .expect(200);

      expect(UserService.getAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'user123' }),
        { isActive: 'true' }
      );
    });
  });

  describe('POST /users', () => {
    it('should create user successfully (admin only)', async () => {
      const userData = createUserData();
      const mockUser = { _id: 'newuser123', ...userData };
      UserService.createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(mockUser);
      expect(UserService.createUser).toHaveBeenCalledWith(userData);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID successfully', async () => {
      const mockUser = { _id: 'user456', ...createUserData() };
      UserService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/user456')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(UserService.getUserById).toHaveBeenCalledWith(
        'user456',
        expect.objectContaining({ _id: 'user123' })
      );
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = { username: 'updateduser' };
      const mockUser = { _id: 'user456', ...updateData };
      UserService.updateUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/users/user456')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(UserService.updateUser).toHaveBeenCalledWith(
        'user456',
        updateData,
        expect.objectContaining({ _id: 'user123' })
      );
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully (admin only)', async () => {
      const mockUser = { _id: 'user456', isActive: false };
      UserService.deactivateUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .delete('/users/user456')
        .expect(200);

      expect(response.body).toEqual({
        message: 'User deactivated successfully',
        user: mockUser
      });
      expect(UserService.deactivateUser).toHaveBeenCalledWith(
        'user456',
        expect.objectContaining({ _id: 'user123' })
      );
    });
  });

  describe('GET /users/admin/stats', () => {
    it('should get user statistics (admin only)', async () => {
      const mockStats = {
        total: 100,
        active: 95,
        inactive: 5,
        admins: 2
      };
      UserService.getUserStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/users/admin/stats')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(UserService.getUserStats).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'user123' })
      );
    });
  });
});