const { testConnection } = require('../config/database');
const { seedTestUser } = require('../seeders/testUser');

async function main() {
  try {
    console.log('🌱 开始数据填充流程...\n');
    
    // 1. 测试数据库连接
    console.log('1️⃣ 测试数据库连接...');
    await testConnection();
    console.log('');
    
    // 2. 创建测试用户和示例数据
    console.log('2️⃣ 创建测试用户和示例数据...');
    await seedTestUser();
    console.log('');
    
    console.log('🎉 数据填充完成!');
    console.log('🚀 现在可以启动服务器并使用测试账号登录了');
    
  } catch (error) {
    console.error('❌ 数据填充失败:', error.message);
    console.error('📋 详细错误:', error);
    process.exit(1);
  }
}

// 运行数据填充
main(); 