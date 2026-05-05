const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'mutindo-super-secret-jwt-key-2024',
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'mutindo-super-secret-jwt-key-2024');
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };