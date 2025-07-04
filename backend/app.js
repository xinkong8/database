const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const { sequelize } = require('./models');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'personal-life-assistant' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// 根路径欢迎页面
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🏠 个人生活管理助手 API 服务',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      tasks: '/api/tasks/*',
      finance: '/api/finance/*',
      health_data: '/api/health/*'
    },
    description: '这是一个RESTful API服务，请使用具体的API端点进行访问',
    timestamp: new Date().toISOString()
  });
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '个人生活管理助手API服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/health', require('./routes/health'));

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'API端点不存在',
    message: `无法找到 ${req.method} ${req.originalUrl}`
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器遇到了问题'
  });
});

const PORT = process.env.PORT || 3001;

// 启动服务器并测试数据库连接
async function startServer() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('📊 数据库连接正常');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log('🚀 服务器启动成功！');
      console.log(`🌐 服务地址: http://localhost:${PORT}`);
      console.log(`📊 数据库连接正常`);
      console.log('✅ 所有路由已加载');
      console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('请检查MySQL服务是否启动和数据库配置是否正确');
    process.exit(1);
  }
}

// 启动服务器
startServer();

module.exports = app; 