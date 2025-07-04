const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceRecord = sequelize.define('FinanceRecord', {
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
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'finance_categories',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true
    }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  recordDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'record_date'
  }
}, {
  tableName: 'finance_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = FinanceRecord; 