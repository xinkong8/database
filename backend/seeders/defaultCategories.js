const { 
  TaskCategory, 
  FinanceCategory, 
  User 
} = require('../models');

// 默认任务分类数据
const defaultTaskCategories = [
  { name: '个人', color: '#409EFF', icon: 'user' },
  { name: '工作', color: '#E6A23C', icon: 'suitcase' },
  { name: '学习', color: '#67C23A', icon: 'education' },
  { name: '健康', color: '#F56C6C', icon: 'plus' },
  { name: '娱乐', color: '#909399', icon: 'star' }
];

// 默认财务分类数据
const defaultFinanceCategories = {
  expense: [
    { name: '餐饮', color: '#FF6B6B', icon: 'food' },
    { name: '交通', color: '#4ECDC4', icon: 'car' },
    { name: '购物', color: '#45B7D1', icon: 'shopping' },
    { name: '娱乐', color: '#96CEB4', icon: 'game' },
    { name: '住房', color: '#FFEAA7', icon: 'home' },
    { name: '医疗', color: '#DDA0DD', icon: 'medical' },
    { name: '教育', color: '#98D8C8', icon: 'book' },
    { name: '其他', color: '#A0A0A0', icon: 'more' }
  ],
  income: [
    { name: '工资', color: '#00B894', icon: 'salary' },
    { name: '奖金', color: '#00CEC9', icon: 'bonus' },
    { name: '投资', color: '#6C5CE7', icon: 'investment' },
    { name: '兼职', color: '#A29BFE', icon: 'parttime' },
    { name: '礼金', color: '#FD79A8', icon: 'gift' },
    { name: '其他', color: '#FDCB6E', icon: 'more' }
  ]
};

// 为用户创建默认分类
const createDefaultCategories = async (userId) => {
  try {
    console.log(`📂 为用户 ${userId} 创建默认分类...`);
    
    // 创建默认任务分类
    const taskCategoriesData = defaultTaskCategories.map(category => ({
      ...category,
      userId
    }));
    
    const createdTaskCategories = await TaskCategory.bulkCreate(taskCategoriesData, {
      ignoreDuplicates: true
    });
    console.log(`✅ 创建了 ${createdTaskCategories.length} 个默认任务分类`);
    
    // 创建默认支出分类
    const expenseCategoriesData = defaultFinanceCategories.expense.map(category => ({
      ...category,
      userId,
      type: 'expense'
    }));
    
    const createdExpenseCategories = await FinanceCategory.bulkCreate(expenseCategoriesData, {
      ignoreDuplicates: true
    });
    console.log(`✅ 创建了 ${createdExpenseCategories.length} 个默认支出分类`);
    
    // 创建默认收入分类
    const incomeCategoriesData = defaultFinanceCategories.income.map(category => ({
      ...category,
      userId,
      type: 'income'
    }));
    
    const createdIncomeCategories = await FinanceCategory.bulkCreate(incomeCategoriesData, {
      ignoreDuplicates: true
    });
    console.log(`✅ 创建了 ${createdIncomeCategories.length} 个默认收入分类`);
    
    return {
      taskCategories: createdTaskCategories,
      expenseCategories: createdExpenseCategories,
      incomeCategories: createdIncomeCategories
    };
    
  } catch (error) {
    console.error('❌ 创建默认分类失败:', error);
    throw error;
  }
};

// 为所有用户创建默认分类
const seedDefaultCategories = async () => {
  try {
    console.log('🌱 开始为所有用户创建默认分类...');
    
    const users = await User.findAll();
    console.log(`👥 找到 ${users.length} 个用户`);
    
    for (const user of users) {
      await createDefaultCategories(user.id);
    }
    
    console.log('🎉 所有用户的默认分类创建完成!');
    
  } catch (error) {
    console.error('❌ 填充默认分类失败:', error);
    throw error;
  }
};

module.exports = {
  createDefaultCategories,
  seedDefaultCategories,
  defaultTaskCategories,
  defaultFinanceCategories
}; 