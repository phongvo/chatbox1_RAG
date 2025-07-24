const BaseService = require('./BaseService');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { NotFoundError, ForbiddenError, ConflictError, ValidationError } = require('../utils/errors');

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  // Get all active users with role-based filtering
  async getAllUsers(requestingUser, filters = {}) {
    const { isActive = true, ...otherFilters } = filters;
    const query = { isActive, ...otherFilters };
    
    // Different data based on authentication and role
    const selectFields = requestingUser && requestingUser.role === 'admin' 
      ? '-password -refreshTokens' 
      : 'username avatar isActive createdAt';
    
    return await this.findAll(query, { select: selectFields });
  }

  // Create new user with password hashing
  async createUser(userData) {
    // Check if user already exists
    const existingUser = await this.findOne({
      $or: [{ email: userData.email }, { username: userData.username }]
    });
    
    if (existingUser) {
      throw new ConflictError('User already exists with this email or username');
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    const user = await this.create(userData);
    
    // Return user without sensitive data
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    
    return userObject;
  }

  // Get user by ID with authorization check
  async getUserById(id, requestingUser) {
    const user = await this.findById(id, '-password -refreshTokens');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check authorization (self or admin)
    if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== id) {
      throw new ForbiddenError('You can only view your own profile');
    }

    return user;
  }

  // Update user with authorization and validation
  async updateUser(id, updateData, requestingUser) {
    const user = await this.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check authorization (self or admin)
    if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== id) {
      throw new ForbiddenError('You can only update your own profile');
    }

    // Only admin can change roles
    if (updateData.role && requestingUser.role !== 'admin') {
      delete updateData.role;
    }

    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const updatedUser = await this.updateById(id, updateData);
    
    // Return without sensitive data
    const userObject = updatedUser.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    
    return userObject;
  }

  // Soft delete user (admin only)
  async deactivateUser(id, requestingUser) {
    if (requestingUser.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }

    const user = await this.softDelete(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return without sensitive data
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    
    return userObject;
  }

  // Find user by email (for authentication)
  async findByEmail(email) {
    return await this.findOne({ email });
  }

  // Update user's refresh tokens
  async updateRefreshTokens(userId, refreshTokens) {
    return await this.updateById(userId, { refreshTokens });
  }

  // Update last login
  async updateLastLogin(userId) {
    return await this.updateById(userId, { lastLogin: new Date() });
  }

  // Get user statistics (admin only)
  async getUserStats(requestingUser) {
    if (requestingUser.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }

    const totalUsers = await this.count();
    const activeUsers = await this.count({ isActive: true });
    const inactiveUsers = await this.count({ isActive: false });
    const adminUsers = await this.count({ role: 'admin' });
    
    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      admins: adminUsers
    };
  }
}

module.exports = new UserService();