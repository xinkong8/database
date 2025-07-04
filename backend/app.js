const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: '个人生活管理助手API服务',
    version: '1.0.0',
    status: 'running',
    time: new Date().toISOString()
  });
});

// API路由 (后续会添加)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/health', require('./routes/health'));

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📱 API地址:  http://localhost:${PORT}`);
  console.log(`📖 API文档: http://localhost:${PORT}/`);
  console.log(`🕒 启动时间: ${new Date().toLocaleString('zh-CN')}`);
});

module.exports = app; 