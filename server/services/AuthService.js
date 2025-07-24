const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserService = require('./UserService');
const { UnauthorizedError, NotFoundError, ValidationError } = require('../utils/errors');

class AuthService {
  constructor() {
    this.userService = UserService;
  }

  // Generate JWT tokens
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );
    
    return { accessToken, refreshToken };
  }

  // Register new user
  async register(userData) {
    // Create user through UserService
    const user = await this.userService.createUser(userData);
    
    // Generate tokens
    const tokens = this.generateTokens(user._id);
    
    // Save refresh token
    await this.userService.updateRefreshTokens(user._id, [
      { token: tokens.refreshToken, createdAt: new Date() }
    ]);
    
    return {
      message: 'User registered successfully',
      user,
      ...tokens
    };
  }

  // Login user
  async login(email, password) {
    // Find user by email
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Generate tokens
    const tokens = this.generateTokens(user._id);
    
    // Update refresh tokens and last login
    const updatedTokens = [...(user.refreshTokens || []), {
      token: tokens.refreshToken,
      createdAt: new Date()
    }];
    
    await this.userService.updateRefreshTokens(user._id, updatedTokens);
    await this.userService.updateLastLogin(user._id);
    
    // Return user without sensitive data
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    
    return {
      message: 'Login successful',
      user: userObject,
      ...tokens
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Find user and check if refresh token exists
    const user = await this.userService.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    
    if (!tokenExists) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    // Generate new tokens
    const tokens = this.generateTokens(user._id);
    
    // Update refresh tokens (remove old, add new)
    const updatedTokens = user.refreshTokens
      .filter(t => t.token !== refreshToken)
      .concat([{ token: tokens.refreshToken, createdAt: new Date() }]);
    
    await this.userService.updateRefreshTokens(user._id, updatedTokens);
    
    return {
      message: 'Token refreshed successfully',
      ...tokens
    };
  }

  // Logout user
  async logout(userId, refreshToken = null) {
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    let updatedTokens;
    
    if (refreshToken) {
      // Remove specific refresh token
      updatedTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    } else {
      // Remove all refresh tokens (logout from all devices)
      updatedTokens = [];
    }
    
    await this.userService.updateRefreshTokens(userId, updatedTokens);
    
    return {
      message: 'Logout successful'
    };
  }

  // Verify access token
  async verifyAccessToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await this.userService.findById(decoded.userId, '-password -refreshTokens');
    
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid token');
    }
    
    return user;
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }
    
    // Update password
    await this.userService.updateUser(userId, { password: newPassword }, user);
    
    return {
      message: 'Password changed successfully'
    };
  }
}

module.exports = new AuthService();