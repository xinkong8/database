const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  changePassword, 
  logout 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, changePasswordSchema } = require('../middleware/validation');

// 用户注册
router.post('/register', validate(registerSchema), register);

// 用户登录
router.post('/login', validate(loginSchema), login);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, getCurrentUser);

// 更新用户信息（需要认证）
router.put('/profile', authenticate, updateProfile);

// 修改密码（需要认证）
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

// 注销登录（需要认证）
router.post('/logout', authenticate, logout);

module.exports = router; 