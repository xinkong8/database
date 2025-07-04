const { testConnection } = require('../config/database');
const { syncDatabase } = require('../models');

async function main() {
  try {
    console.log('🚀 开始数据库同步流程...\n');
    
    // 1. 测试数据库连接
    console.log('1️⃣ 测试数据库连接...');
    await testConnection();
    console.log('');
    
    // 2. 同步数据库表结构
    console.log('2️⃣ 同步数据库表结构...');
    
    // 开发环境可以使用 force: true 重新创建表
    // 生产环境务必设置为 false
    const syncOptions = {
      force: process.env.NODE_ENV === 'development', // 开发环境重新创建表
      alter: process.env.NODE_ENV !== 'development'  // 生产环境只修改表结构
    };
    
    console.log(`同步选项: ${JSON.stringify(syncOptions, null, 2)}`);
    await syncDatabase(syncOptions);
    console.log('');
    
    console.log('🎉 数据库同步完成!');
    console.log('📊 现在可以开始使用数据库了');
    
  } catch (error) {
    console.error('❌ 数据库同步失败:', error.message);
    console.error('📋 详细错误:', error);
    process.exit(1);
  }
}

// 运行同步
main(); 