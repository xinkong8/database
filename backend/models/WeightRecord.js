const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WeightRecord = sequelize.define('WeightRecord', {
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
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 10,
      max: 500,
      isDecimal: true
    }
  },
  bmi: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 10,
      max: 50,
      isDecimal: true
    }
  },
  recordDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'record_date'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'weight_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'record_date'],
      name: 'unique_user_date_weight'
    }
  ]
});

module.exports = WeightRecord; 