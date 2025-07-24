const { UserService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

class UserController {
  // Get all users
  getAllUsers = asyncHandler(async (req, res) => {
    const users = await UserService.getAllUsers(req.user, req.query);
    res.json(users);
  });

  // Create user (admin only)
  createUser = asyncHandler(async (req, res) => {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  });

  // Get user by ID
  getUserById = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id, req.user);
    res.json(user);
  });

  // Update user
  updateUser = asyncHandler(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body, req.user);
    res.json(user);
  });

  // Delete user (admin only)
  deleteUser = asyncHandler(async (req, res) => {
    const user = await UserService.deactivateUser(req.params.id, req.user);
    res.json({ message: 'User deactivated successfully', user });
  });

  // Get user statistics (admin only)
  getUserStats = asyncHandler(async (req, res) => {
    const stats = await UserService.getUserStats(req.user);
    res.json(stats);
  });
}

module.exports = new UserController();