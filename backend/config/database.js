const { Sequelize } = require('sequelize');
require('dotenv').config();

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '225231',
  database: process.env.DB_NAME || 'personal_life_db',
  
  // 连接池配置
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // 日志配置
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // 时区配置
  timezone: '+08:00',
  
  // 其他配置
  define: {
    // 自动添加时间戳
    timestamps: true,
    // 使用驼峰命名
    underscored: false,
    // 表名不使用复数
    freezeTableName: false,
    // 字符集
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功!');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  testConnection
}; 