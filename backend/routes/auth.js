const express = require('express');
const bcrypt = require('bcryptjs');
const { dbGet, dbRun } = require('../models/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, real_name } = req.body;

    // 参数验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码都是必填项'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }

    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const result = await dbRun(
      'INSERT INTO users (username, email, password, real_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, real_name || null]
    );

    // 生成token
    const token = generateToken(result.id);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: result.id,
          username,
          email,
          real_name: real_name || null,
          avatar: null
        },
        token
      }
    });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码都是必填项'
      });
    }

    // 查找用户
    const user = await dbGet('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          real_name: user.real_name,
          avatar: user.avatar
        },
        token
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 获取用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 获取当前用户信息 (别名路由)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // 从数据库获取最新用户信息
    const user = await dbGet('SELECT id, username, email, real_name, avatar FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '获取用户信息成功',
      data: user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { real_name, email } = req.body;
    const userId = req.userId;

    // 检查邮箱是否被其他用户使用
    if (email) {
      const existingUser = await dbGet('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被其他用户使用'
        });
      }
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (real_name !== undefined) {
      updateFields.push('real_name = ?');
      updateValues.push(real_name);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    // 更新用户信息
    await dbRun(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // 获取更新后的用户信息
    const updatedUser = await dbGet('SELECT id, username, email, real_name, avatar FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

// 用户登出（前端处理，后端只是一个确认接口）
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

module.exports = router; 