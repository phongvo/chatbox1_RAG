const { AuthService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  // Register
  register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  });

  // Login
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  });

  // Refresh token
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json(result);
  });

  // Logout
  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.logout(req.user._id, refreshToken);
    res.json(result);
  });

  // Get current user
  getCurrentUser = (req, res) => {
    res.json({ user: req.user });
  };

  // Change password
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user._id, currentPassword, newPassword);
    res.json(result);
  });
}

module.exports = new AuthController();