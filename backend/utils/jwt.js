const jwt = require('jsonwebtoken');
const config = require('../config/config');

// 生成JWT令牌
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// 从请求头中提取令牌
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  // 格式: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// 生成用户令牌载荷
const createUserPayload = (user) => {
  return {
    userId: user.id,
    username: user.username,
    email: user.email
  };
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  createUserPayload
}; 