const jwt = require('jsonwebtoken');
const { dbGet } = require('../models/database');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// 生成JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { 
      userId: userId,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { 
      expiresIn: '7d' // 7天过期
    }
  );
};

// 验证JWT Token中间件
const authenticateToken = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，缺少访问令牌'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查用户是否存在
    const user = await dbGet('SELECT id, username, email, avatar, real_name FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌，用户不存在'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Token验证失败:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期，请重新登录'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
};

// 可选的认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await dbGet('SELECT id, username, email, avatar, real_name FROM users WHERE id = ?', [decoded.userId]);
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    next();
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth
}; 