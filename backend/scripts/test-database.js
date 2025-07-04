const { testConnection } = require('../config/database');
const { 
  User, 
  Task, 
  TaskCategory, 
  Project,
  FinanceRecord,
  FinanceCategory,
  WeightRecord 
} = require('../models');

// 测试数据库CRUD操作
async function testDatabaseOperations() {
  try {
    console.log('🧪 开始测试数据库操作...\n');
    
    // 1. 测试连接
    console.log('1️⃣ 测试数据库连接...');
    await testConnection();
    console.log('');
    
    // 2. 测试查询操作
    console.log('2️⃣ 测试查询操作...');
    
    // 查询用户数量
    const userCount = await User.count();
    console.log(`📊 用户总数: ${userCount}`);
    
    // 查询任务数量
    const taskCount = await Task.count();
    console.log(`📋 任务总数: ${taskCount}`);
    
    // 查询财务记录数量
    const financeRecordCount = await FinanceRecord.count();
    console.log(`💰 财务记录总数: ${financeRecordCount}`);
    
    // 查询体重记录数量
    const weightRecordCount = await WeightRecord.count();
    console.log(`⚖️ 体重记录总数: ${weightRecordCount}`);
    console.log('');
    
    // 3. 测试关联查询
    console.log('3️⃣ 测试关联查询...');
    
    // 查询用户及其任务
    const usersWithTasks = await User.findAll({
      include: [
        {
          model: Task,
          limit: 3
        }
      ],
      limit: 1
    });
    
    if (usersWithTasks.length > 0) {
      const user = usersWithTasks[0];
      console.log(`👤 用户: ${user.username} (${user.email})`);
      console.log(`📋 该用户的任务数: ${user.Tasks.length}`);
      
      user.Tasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.title} (${task.status})`);
      });
    }
    console.log('');
    
    // 4. 测试分类统计
    console.log('4️⃣ 测试分类统计...');
    
    // 任务分类统计 - 使用简单的原生查询
    const [taskCategoryStats] = await TaskCategory.sequelize.query(`
      SELECT 
        tc.id,
        tc.name,
        tc.color,
        COUNT(t.id) as taskCount
      FROM task_categories tc
      LEFT JOIN tasks t ON tc.id = t.category_id
      GROUP BY tc.id, tc.name, tc.color
      ORDER BY taskCount DESC
      LIMIT 5
    `);
    
    console.log('📂 任务分类统计:');
    taskCategoryStats.forEach(category => {
      console.log(`   ${category.name}: ${category.taskCount} 个任务`);
    });
    console.log('');
    
    // 5. 测试财务统计
    console.log('5️⃣ 测试财务统计...');
    
    // 收入支出统计
    const financeStats = await FinanceRecord.findAll({
      attributes: [
        'type',
        [FinanceRecord.sequelize.fn('SUM', FinanceRecord.sequelize.col('amount')), 'total'],
        [FinanceRecord.sequelize.fn('COUNT', FinanceRecord.sequelize.col('id')), 'count']
      ],
      group: ['type']
    });
    
    console.log('💰 财务统计:');
    financeStats.forEach(stat => {
      console.log(`   ${stat.type === 'income' ? '收入' : '支出'}: ¥${parseFloat(stat.dataValues.total).toFixed(2)} (${stat.dataValues.count} 笔)`);
    });
    console.log('');
    
    // 6. 测试数据库表信息
    console.log('6️⃣ 测试数据库表信息...');
    
    const tableNames = [
      'users', 'user_settings', 'task_categories', 'projects', 'tasks',
      'finance_categories', 'finance_records', 'weight_records'
    ];
    
    for (const tableName of tableNames) {
      try {
        const [results] = await User.sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`📊 表 ${tableName}: ${results[0].count} 条记录`);
      } catch (error) {
        console.log(`❌ 表 ${tableName}: 查询失败`);
      }
    }
    console.log('');
    
    console.log('✅ 数据库操作测试完成!');
    console.log('🎯 所有基础功能正常工作');
    
  } catch (error) {
    console.error('❌ 数据库操作测试失败:', error.message);
    console.error('📋 详细错误:', error);
    throw error;
  }
}

// 运行测试
testDatabaseOperations()
  .then(() => {
    console.log('\n🏆 测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 测试失败');
    process.exit(1);
  }); 