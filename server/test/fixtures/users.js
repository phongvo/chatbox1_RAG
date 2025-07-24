const bcrypt = require('bcryptjs');

const createUserData = (overrides = {}) => ({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  role: 'user',
  isActive: true,
  ...overrides
});

const createAdminData = (overrides = {}) => ({
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  ...overrides
});

const createHashedPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

module.exports = {
  createUserData,
  createAdminData,
  createHashedPassword
};