const { verifyToken, extractToken } = require('../utils/jwt');
const { User } = require('../models');

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 提取令牌
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        error: '认证失败',
        message: '缺少访问令牌'
      });
    }
    
    // 验证令牌
    const decoded = verifyToken(token);
    
    // 查找用户
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: '认证失败',
        message: '用户不存在'
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    req.userId = user.id;
    
    next();
    
  } catch (error) {
    return res.status(401).json({
      error: '认证失败',
      message: error.message || '无效的访问令牌'
    });
  }
};

// 可选认证中间件（允许访客访问）
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId);
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
    
  } catch (error) {
    // 可选认证失败时不阻止请求
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
}; 