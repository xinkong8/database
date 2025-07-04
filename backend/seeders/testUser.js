const bcrypt = require('bcryptjs');
const { 
  User, 
  UserSettings, 
  Task, 
  Project, 
  FinanceRecord,
  WeightRecord 
} = require('../models');
const { createDefaultCategories } = require('./defaultCategories');

// 创建测试用户
const createTestUser = async () => {
  try {
    console.log('👤 创建测试用户...');
    
    // 检查是否已存在测试用户
    const existingUser = await User.findOne({ 
      where: { email: 'test@example.com' } 
    });
    
    if (existingUser) {
      console.log('📋 测试用户已存在，跳过创建');
      return existingUser;
    }
    
    // 创建密码哈希
    const passwordHash = await bcrypt.hash('123456', 12);
    
    // 创建用户
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash,
      avatar: null
    });
    
    console.log(`✅ 创建测试用户成功: ${user.username} (ID: ${user.id})`);
    
    // 创建用户设置
    await UserSettings.create({
      userId: user.id,
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: false,
        taskReminder: true,
        financeAlert: true
      }
    });
    
    console.log('⚙️ 创建用户设置成功');
    
    // 为用户创建默认分类
    await createDefaultCategories(user.id);
    
    return user;
    
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
    throw error;
  }
};

// 创建示例数据
const createSampleData = async (userId) => {
  try {
    console.log('📊 创建示例数据...');
    
    // 获取用户的分类数据
    const { TaskCategory, FinanceCategory } = require('../models');
    
    const taskCategories = await TaskCategory.findAll({ where: { userId } });
    const financeCategories = await FinanceCategory.findAll({ where: { userId } });
    
    // 创建示例项目
    const project = await Project.create({
      userId,
      name: '个人成长计划',
      description: '提升个人技能和生活质量的长期项目',
      color: '#409EFF',
      status: 'active'
    });
    
    console.log('📁 创建示例项目成功');
    
    // 创建示例任务
    const personalCategory = taskCategories.find(cat => cat.name === '个人');
    const sampleTasks = [
      {
        userId,
        categoryId: personalCategory?.id,
        projectId: project.id,
        title: '开始使用个人生活管理助手',
        description: '熟悉系统的各项功能',
        priority: 'high',
        status: 'completed',
        completedAt: new Date()
      },
      {
        userId,
        categoryId: personalCategory?.id,
        projectId: project.id,
        title: '设置个人目标',
        description: '制定短期和长期的个人发展目标',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后
      },
      {
        userId,
        categoryId: personalCategory?.id,
        title: '每日晨练',
        description: '保持身体健康的日常运动',
        priority: 'medium',
        status: 'in_progress'
      }
    ];
    
    await Task.bulkCreate(sampleTasks);
    console.log(`✅ 创建了 ${sampleTasks.length} 个示例任务`);
    
    // 创建示例财务记录
    const foodCategory = financeCategories.find(cat => cat.name === '餐饮' && cat.type === 'expense');
    const salaryCategory = financeCategories.find(cat => cat.name === '工资' && cat.type === 'income');
    
    const sampleFinanceRecords = [
      {
        userId,
        categoryId: salaryCategory?.id,
        type: 'income',
        amount: 8000.00,
        description: '月薪',
        recordDate: new Date().toISOString().split('T')[0]
      },
      {
        userId,
        categoryId: foodCategory?.id,
        type: 'expense',
        amount: 25.50,
        description: '午餐',
        recordDate: new Date().toISOString().split('T')[0]
      },
      {
        userId,
        categoryId: foodCategory?.id,
        type: 'expense',
        amount: 15.00,
        description: '早餐',
        recordDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];
    
    await FinanceRecord.bulkCreate(sampleFinanceRecords);
    console.log(`💰 创建了 ${sampleFinanceRecords.length} 个示例财务记录`);
    
    // 创建示例体重记录
    const sampleWeightRecords = [
      {
        userId,
        weight: 70.5,
        bmi: 22.8,
        recordDate: new Date().toISOString().split('T')[0],
        notes: '今日体重'
      },
      {
        userId,
        weight: 71.0,
        bmi: 23.0,
        recordDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '一周前体重'
      }
    ];
    
    await WeightRecord.bulkCreate(sampleWeightRecords);
    console.log(`⚖️ 创建了 ${sampleWeightRecords.length} 个示例体重记录`);
    
    console.log('🎉 示例数据创建完成!');
    
  } catch (error) {
    console.error('❌ 创建示例数据失败:', error);
    throw error;
  }
};

// 主函数
const seedTestUser = async () => {
  try {
    const user = await createTestUser();
    await createSampleData(user.id);
    
    console.log('\n🎯 测试用户和示例数据创建完成!');
    console.log('📧 登录信息:');
    console.log('   邮箱: test@example.com');
    console.log('   密码: 123456');
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    throw error;
  }
};

module.exports = {
  createTestUser,
  createSampleData,
  seedTestUser
}; 