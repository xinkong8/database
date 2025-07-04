const bcrypt = require('bcryptjs');
const { User, UserSettings } = require('../models');
const { generateToken, createUserPayload } = require('../utils/jwt');

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: '注册失败',
        message: '该邮箱已被注册'
      });
    }
    
    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        error: '注册失败',
        message: '该用户名已被使用'
      });
    }
    
    // 创建用户
    const user = await User.create({
      username,
      email,
      passwordHash: password // 模型中有beforeCreate钩子会自动加密
    });
    
    // 创建默认用户设置
    await UserSettings.create({
      userId: user.id,
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        browser: true,
        taskReminders: true,
        financeAlerts: true
      }
    });
    
    // 生成JWT令牌
    const token = generateToken(createUserPayload(user));
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: '注册失败',
      message: '服务器内部错误'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: UserSettings,
        as: 'UserSetting'
      }]
    });
    
    if (!user) {
      return res.status(401).json({
        error: '登录失败',
        message: '邮箱或密码错误'
      });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '登录失败',
        message: '邮箱或密码错误'
      });
    }
    
    // 更新最后登录时间
    await user.update({ lastLoginAt: new Date() });
    
    // 生成JWT令牌
    const token = generateToken(createUserPayload(user));
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          settings: user.UserSetting
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: '登录失败',
      message: '服务器内部错误'
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{
        model: UserSettings,
        as: 'UserSetting'
      }],
      attributes: { exclude: ['passwordHash'] }
    });
    
    if (!user) {
      return res.status(404).json({
        error: '用户未找到',
        message: '用户信息不存在'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: '获取用户信息失败',
      message: '服务器内部错误'
    });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: '用户未找到',
        message: '用户信息不存在'
      });
    }
    
    // 如果更新用户名，检查是否已存在
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          error: '更新失败',
          message: '该用户名已被使用'
        });
      }
    }
    
    // 更新用户信息
    const updatedUser = await user.update({
      username: username || user.username,
      avatar: avatar || user.avatar
    });
    
    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          updatedAt: updatedUser.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: '更新用户信息失败',
      message: '服务器内部错误'
    });
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: '用户未找到',
        message: '用户信息不存在'
      });
    }
    
    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '密码修改失败',
        message: '当前密码错误'
      });
    }
    
    // 更新密码
    await user.update({ passwordHash: newPassword }); // 模型中有钩子会自动加密
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: '密码修改失败',
      message: '服务器内部错误'
    });
  }
};

// 注销登录（客户端删除token即可，这里可以做一些记录）
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: '注销成功'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: '注销失败',
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout
}; 