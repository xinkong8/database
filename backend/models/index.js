const { sequelize } = require('../config/database');

// 导入所有模型
const User = require('./User');
const UserSettings = require('./UserSettings');
const TaskCategory = require('./TaskCategory');
const Project = require('./Project');
const Task = require('./Task');
const FinanceCategory = require('./FinanceCategory');
const FinanceRecord = require('./FinanceRecord');
const WeightRecord = require('./WeightRecord');

// 定义模型关联关系
const defineAssociations = () => {
  // 用户与用户设置的关联 (1:1)
  User.hasOne(UserSettings, {
    foreignKey: 'userId',
    as: 'UserSetting',
    onDelete: 'CASCADE'
  });
  UserSettings.belongsTo(User, {
    foreignKey: 'userId'
  });

  // 用户与任务相关的关联 (1:N)
  User.hasMany(TaskCategory, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  TaskCategory.belongsTo(User, {
    foreignKey: 'userId'
  });

  User.hasMany(Project, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  Project.belongsTo(User, {
    foreignKey: 'userId'
  });

  User.hasMany(Task, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  Task.belongsTo(User, {
    foreignKey: 'userId'
  });

  // 任务分类与任务的关联 (1:N)
  TaskCategory.hasMany(Task, {
    foreignKey: 'categoryId',
    onDelete: 'SET NULL'
  });
  Task.belongsTo(TaskCategory, {
    foreignKey: 'categoryId'
  });

  // 项目与任务的关联 (1:N)
  Project.hasMany(Task, {
    foreignKey: 'projectId',
    onDelete: 'SET NULL'
  });
  Task.belongsTo(Project, {
    foreignKey: 'projectId'
  });

  // 用户与财务相关的关联 (1:N)
  User.hasMany(FinanceCategory, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  FinanceCategory.belongsTo(User, {
    foreignKey: 'userId'
  });

  User.hasMany(FinanceRecord, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  FinanceRecord.belongsTo(User, {
    foreignKey: 'userId'
  });

  // 财务分类与财务记录的关联 (1:N)
  FinanceCategory.hasMany(FinanceRecord, {
    foreignKey: 'categoryId',
    onDelete: 'RESTRICT'
  });
  FinanceRecord.belongsTo(FinanceCategory, {
    foreignKey: 'categoryId'
  });

  // 用户与健康记录的关联 (1:N)
  User.hasMany(WeightRecord, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  WeightRecord.belongsTo(User, {
    foreignKey: 'userId'
  });
};

// 执行关联定义
defineAssociations();

// 数据库同步函数
const syncDatabase = async (options = {}) => {
  try {
    console.log('🔄 开始同步数据库...');
    await sequelize.sync(options);
    console.log('✅ 数据库同步完成!');
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  UserSettings,
  TaskCategory,
  Project,
  Task,
  FinanceCategory,
  FinanceRecord,
  WeightRecord,
  syncDatabase
}; 