const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/authController');
const AuthService = require('../../services/AuthService');
const { createTestUser, generateTestToken } = require('../utils/auth');
const { createUserData } = require('../fixtures/users');

// Mock the AuthService
jest.mock('../../services/AuthService');

const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/refresh', authController.refreshToken);
app.post('/logout', (req, res, next) => {
  req.user = { _id: 'user123' };
  next();
}, authController.logout);
app.get('/me', (req, res, next) => {
  req.user = { _id: 'user123', username: 'testuser' };
  next();
}, authController.getCurrentUser);
app.post('/change-password', (req, res, next) => {
  req.user = { _id: 'user123' };
  next();
}, authController.changePassword);

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = createUserData();
      const mockResponse = {
        message: 'User registered successfully',
        user: { _id: 'user123', ...userData },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      AuthService.register.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(AuthService.register).toHaveBeenCalledWith(userData);
    });

    it('should handle registration errors', async () => {
      const userData = createUserData();
      AuthService.register.mockRejectedValue(new Error('User already exists'));

      await request(app)
        .post('/register')
        .send(userData)
        .expect(500);
    });
  });

  describe('POST /login', () => {
    it('should login user successfully', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        message: 'Login successful',
        user: { _id: 'user123', email: 'test@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      AuthService.login.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(AuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
    });

    it('should handle invalid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' };
      AuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await request(app)
        .post('/login')
        .send(loginData)
        .expect(500);
    });
  });

  describe('POST /refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshData = { refreshToken: 'valid-refresh-token' };
      const mockResponse = {
        message: 'Token refreshed successfully',
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      AuthService.refreshAccessToken.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/refresh')
        .send(refreshData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(AuthService.refreshAccessToken).toHaveBeenCalledWith(refreshData.refreshToken);
    });
  });

  describe('POST /logout', () => {
    it('should logout user successfully', async () => {
      const logoutData = { refreshToken: 'refresh-token' };
      const mockResponse = { message: 'Logout successful' };

      AuthService.logout.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/logout')
        .send(logoutData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(AuthService.logout).toHaveBeenCalledWith('user123', logoutData.refreshToken);
    });
  });

  describe('GET /me', () => {
    it('should return current user', async () => {
      const response = await request(app)
        .get('/me')
        .expect(200);

      expect(response.body).toEqual({
        user: { _id: 'user123', username: 'testuser' }
      });
    });
  });

  describe('POST /change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword'
      };
      const mockResponse = { message: 'Password changed successfully' };

      AuthService.changePassword.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/change-password')
        .send(passwordData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(AuthService.changePassword).toHaveBeenCalledWith(
        'user123',
        passwordData.currentPassword,
        passwordData.newPassword
      );
    });
  });
});