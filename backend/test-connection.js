// MySQL连接测试脚本
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 正在测试MySQL连接...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '225231', // 请填入你的MySQL密码
      database: 'personal_life_db'
    });

    console.log('✅ MySQL连接成功！');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 MySQL版本: ${rows[0].version}`);
    
    // 显示数据库信息
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📁 可用数据库:', databases.map(db => db.Database));
    
    await connection.end();
    console.log('🔐 连接已关闭');
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.log('\n💡 请检查:');
    console.log('1. MySQL服务是否正在运行');
    console.log('2. 数据库 personal_life_db 是否已创建');
    console.log('3. 用户名密码是否正确');
  }
}

testConnection(); 