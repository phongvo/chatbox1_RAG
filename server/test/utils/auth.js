const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { createUserData, createAdminData, createHashedPassword } = require('../fixtures/users');

const createTestUser = async (userData = {}) => {
  const data = createUserData(userData);
  if (data.password) {
    data.password = await createHashedPassword(data.password);
  }
  return await User.create(data);
};

const createTestAdmin = async (userData = {}) => {
  const data = createAdminData(userData);
  if (data.password) {
    data.password = await createHashedPassword(data.password);
  }
  return await User.create(data);
};

const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateTestRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  createTestUser,
  createTestAdmin,
  generateTestToken,
  generateTestRefreshToken
};