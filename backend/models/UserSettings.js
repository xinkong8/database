const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserSettings = sequelize.define('UserSettings', {
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
  theme: {
    type: DataTypes.STRING(20),
    defaultValue: 'light',
    validate: {
      isIn: [['light', 'dark', 'auto']]
    }
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'zh-CN',
    validate: {
      isIn: [['zh-CN', 'en-US', 'ja-JP']]
    }
  },
  notifications: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'user_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = UserSettings; 