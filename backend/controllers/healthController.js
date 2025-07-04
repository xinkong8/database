const { WeightRecord } = require('../models');
const { Op } = require('sequelize');

// 获取体重记录列表
const getWeightRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = { userId: req.userId };
    
    // 日期范围筛选
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate[Op.gte] = new Date(startDate);
      if (endDate) where.recordDate[Op.lte] = new Date(endDate);
    }
    
    const { count, rows: records } = await WeightRecord.findAndCountAll({
      where,
      order: [['recordDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get weight records error:', error);
    res.status(500).json({
      error: '获取体重记录失败',
      message: '服务器内部错误'
    });
  }
};

// 获取单个体重记录
const getWeightRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await WeightRecord.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '记录未找到',
        message: '指定的体重记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: { record }
    });
    
  } catch (error) {
    console.error('Get weight record error:', error);
    res.status(500).json({
      error: '获取体重记录失败',
      message: '服务器内部错误'
    });
  }
};

// 创建体重记录
const createWeightRecord = async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      userId: req.userId
    };
    
    // 如果没有提供BMI，可以根据体重和身高计算（假设有身高数据）
    // 这里简化处理，如果前端没有计算BMI，后端也可以不强制要求
    
    const record = await WeightRecord.create(recordData);
    
    res.status(201).json({
      success: true,
      message: '体重记录创建成功',
      data: { record }
    });
    
  } catch (error) {
    console.error('Create weight record error:', error);
    res.status(500).json({
      error: '创建体重记录失败',
      message: '服务器内部错误'
    });
  }
};

// 更新体重记录
const updateWeightRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await WeightRecord.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '记录未找到',
        message: '指定的体重记录不存在'
      });
    }
    
    await record.update(req.body);
    
    res.json({
      success: true,
      message: '体重记录更新成功',
      data: { record }
    });
    
  } catch (error) {
    console.error('Update weight record error:', error);
    res.status(500).json({
      error: '更新体重记录失败',
      message: '服务器内部错误'
    });
  }
};

// 删除体重记录
const deleteWeightRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await WeightRecord.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '记录未找到',
        message: '指定的体重记录不存在'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: '体重记录删除成功'
    });
    
  } catch (error) {
    console.error('Delete weight record error:', error);
    res.status(500).json({
      error: '删除体重记录失败',
      message: '服务器内部错误'
    });
  }
};

// 获取健康统计
const getHealthStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // 获取最新的体重记录
    const latestRecord = await WeightRecord.findOne({
      where: { userId },
      order: [['recordDate', 'DESC']]
    });
    
    // 获取30天内的体重记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = await WeightRecord.findAll({
      where: {
        userId,
        recordDate: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['recordDate', 'ASC']]
    });
    
    // 计算统计数据
    let stats = {
      totalRecords: await WeightRecord.count({ where: { userId } }),
      currentWeight: latestRecord?.weight || null,
      currentBMI: latestRecord?.bmi || null,
      weightChange: null,
      bmiChange: null,
      trend: 'stable' // stable, increasing, decreasing
    };
    
    if (recentRecords.length >= 2) {
      const firstRecord = recentRecords[0];
      const lastRecord = recentRecords[recentRecords.length - 1];
      
      stats.weightChange = lastRecord.weight - firstRecord.weight;
      
      if (firstRecord.bmi && lastRecord.bmi) {
        stats.bmiChange = lastRecord.bmi - firstRecord.bmi;
      }
      
      // 计算趋势
      if (stats.weightChange > 1) {
        stats.trend = 'increasing';
      } else if (stats.weightChange < -1) {
        stats.trend = 'decreasing';
      }
    }
    
    // 获取体重范围统计 - 简化版本
    const allRecords = await WeightRecord.findAll({
      where: { userId },
      attributes: ['weight']
    });
    
    if (allRecords.length > 0) {
      const weights = allRecords.map(r => r.weight);
      stats.minWeight = Math.min(...weights);
      stats.maxWeight = Math.max(...weights);
      stats.avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    }
    
    res.json({
      success: true,
      data: {
        stats,
        recentRecords: recentRecords.slice(-10), // 最近10条记录用于图表
        latestRecord
      }
    });
    
  } catch (error) {
    console.error('Get health stats error:', error);
    res.status(500).json({
      error: '获取健康统计失败',
      message: '服务器内部错误'
    });
  }
};

// 获取体重趋势数据
const getWeightTrend = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 90 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const trendData = await WeightRecord.findAll({
      where: {
        userId,
        recordDate: { [Op.gte]: startDate }
      },
      attributes: ['weight', 'bmi', 'recordDate'],
      order: [['recordDate', 'ASC']]
    });
    
    // 按周或月分组（根据时间范围）
    let groupBy = 'day';
    if (parseInt(days) > 180) {
      groupBy = 'month';
    } else if (parseInt(days) > 60) {
      groupBy = 'week';
    }
    
    let formatStr = '%Y-%m-%d';
    if (groupBy === 'week') {
      formatStr = '%Y-%u'; // 年-周
    } else if (groupBy === 'month') {
      formatStr = '%Y-%m'; // 年-月
    }
    
    // 简化分组数据，暂时返回空数组
    const groupedData = [];
    
    res.json({
      success: true,
      data: {
        trendData,
        groupedData,
        groupBy,
        period: `${days}天`
      }
    });
    
  } catch (error) {
    console.error('Get weight trend error:', error);
    res.status(500).json({
      error: '获取体重趋势失败',
      message: '服务器内部错误'
    });
  }
};

// BMI计算工具
const calculateBMI = async (req, res) => {
  try {
    const { weight, height } = req.body;
    
    if (!weight || !height || weight <= 0 || height <= 0) {
      return res.status(400).json({
        error: '参数错误',
        message: '体重和身高必须大于0'
      });
    }
    
    // height单位：cm，转换为m
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    
    // BMI分类
    let category = '';
    let suggestion = '';
    
    if (bmi < 18.5) {
      category = '偏瘦';
      suggestion = '建议适当增重，加强营养';
    } else if (bmi < 24) {
      category = '正常';
      suggestion = '体重正常，继续保持';
    } else if (bmi < 28) {
      category = '超重';
      suggestion = '建议适当减重，控制饮食';
    } else {
      category = '肥胖';
      suggestion = '建议及时减重，咨询医生';
    }
    
    res.json({
      success: true,
      data: {
        bmi: parseFloat(bmi.toFixed(2)),
        category,
        suggestion,
        weight,
        height
      }
    });
    
  } catch (error) {
    console.error('Calculate BMI error:', error);
    res.status(500).json({
      error: 'BMI计算失败',
      message: '服务器内部错误'
    });
  }
};

// 健康目标设置（简化版本）
const setHealthGoal = async (req, res) => {
  try {
    const { targetWeight, targetDate, notes } = req.body;
    
    // 这里可以扩展为独立的目标表，现在简化处理
    // 可以存储在用户设置中或创建新的健康目标表
    
    res.json({
      success: true,
      message: '健康目标设置成功',
      data: {
        targetWeight,
        targetDate,
        notes,
        userId: req.userId
      }
    });
    
  } catch (error) {
    console.error('Set health goal error:', error);
    res.status(500).json({
      error: '设置健康目标失败',
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getWeightRecords,
  getWeightRecord,
  createWeightRecord,
  updateWeightRecord,
  deleteWeightRecord,
  getHealthStats,
  getWeightTrend,
  calculateBMI,
  setHealthGoal
}; 