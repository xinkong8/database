const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskCategory = sequelize.define('TaskCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [1, 50],
      notEmpty: true
    }
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#409EFF',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'list'
  }
}, {
  tableName: 'task_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'name'],
      name: 'unique_user_category'
    }
  ]
});

module.exports = TaskCategory; 