const { FinanceRecord, FinanceCategory } = require('../models');
const { Op } = require('sequelize');

// 获取财务记录列表
const getFinanceRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      categoryId, 
      startDate, 
      endDate,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = { userId: req.userId };
    
    // 添加筛选条件
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    
    // 日期范围筛选
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate[Op.gte] = new Date(startDate);
      if (endDate) where.recordDate[Op.lte] = new Date(endDate);
    }
    
    // 搜索功能
    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }
    
    const { count, rows: records } = await FinanceRecord.findAndCountAll({
      where,
      include: [
        {
          model: FinanceCategory,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ],
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
    console.error('Get finance records error:', error);
    res.status(500).json({
      error: '获取财务记录失败',
      message: '服务器内部错误'
    });
  }
};

// 获取单个财务记录
const getFinanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await FinanceRecord.findOne({
      where: { id, userId: req.userId },
      include: [
        {
          model: FinanceCategory,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });
    
    if (!record) {
      return res.status(404).json({
        error: '记录未找到',
        message: '指定的财务记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: { record }
    });
    
  } catch (error) {
    console.error('Get finance record error:', error);
    res.status(500).json({
      error: '获取财务记录失败',
      message: '服务器内部错误'
    });
  }
};

// 创建财务记录
const createFinanceRecord = async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      userId: req.userId
    };
    
    // 验证分类是否属于当前用户且类型匹配
    const category = await FinanceCategory.findOne({
      where: { id: recordData.categoryId, userId: req.userId }
    });
    
    if (!category) {
      return res.status(400).json({
        error: '创建记录失败',
        message: '指定的分类不存在'
      });
    }
    
    if (category.type !== recordData.type) {
      return res.status(400).json({
        error: '创建记录失败',
        message: '记录类型与分类类型不匹配'
      });
    }
    
    const record = await FinanceRecord.create(recordData);
    
    // 获取完整的记录信息（包含关联数据）
    const createdRecord = await FinanceRecord.findByPk(record.id, {
      include: [
        {
          model: FinanceCategory,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: '财务记录创建成功',
      data: { record: createdRecord }
    });
    
  } catch (error) {
    console.error('Create finance record error:', error);
    res.status(500).json({
      error: '创建财务记录失败',
      message: '服务器内部错误'
    });
  }
};

// 更新财务记录
const updateFinanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await FinanceRecord.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '记录未找到',
        message: '指定的财务记录不存在'
      });
    }
    
    // 如果更新分类，验证分类是否属于当前用户且类型匹配
    if (req.body.categoryId) {
      const category = await FinanceCategory.findOne({
        where: { id: req.body.categoryId, userId: req.userId }
      });
      
      if (!category) {
        return res.status(400).json({
          error: '更新记录失败',
          message: '指定的分类不存在'
        });
      }
      
      const recordType = req.body.type || record.type;
      if (category.type !== recordType) {
        return res.status(400).json({
          error: '更新记录失败',
          message: '记录类型与分类类型不匹配'
        });
      }
    }
    
    await record.update(req.body);
    
    // 获取更新后的完整记录信息
    const updatedRecord = await FinanceRecord.findByPk(record.id, {
      include: [
        {
          model: FinanceCategory,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });
    
    res.json({
      success: true,
      message: '财务记录更新成功',
      data: { record: updatedRecord }
    });
    
  } catch (error) {
    console.error('Update finance record error:', error);
    res.status(500).json({
      error: '更新财务记录失败',
      message: '服务器内部错误'
    });
  }
};

// 删除财务记录
const deleteFinanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await FinanceRecord.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!record) {
      return res.status(404).json({
        error: '记录未找到',
        message: '指定的财务记录不存在'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: '财务记录删除成功'
    });
    
  } catch (error) {
    console.error('Delete finance record error:', error);
    res.status(500).json({
      error: '删除财务记录失败',
      message: '服务器内部错误'
    });
  }
};

// 获取财务分类列表
const getFinanceCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { userId: req.userId };
    
    if (type) where.type = type;
    
    const categories = await FinanceCategory.findAll({
      where,
      order: [['createdAt', 'ASC']]
    });
    
    res.json({
      success: true,
      data: { categories }
    });
    
  } catch (error) {
    console.error('Get finance categories error:', error);
    res.status(500).json({
      error: '获取财务分类失败',
      message: '服务器内部错误'
    });
  }
};

// 创建财务分类
const createFinanceCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      userId: req.userId
    };
    
    const category = await FinanceCategory.create(categoryData);
    
    res.status(201).json({
      success: true,
      message: '财务分类创建成功',
      data: { category }
    });
    
  } catch (error) {
    console.error('Create finance category error:', error);
    res.status(500).json({
      error: '创建财务分类失败',
      message: '服务器内部错误'
    });
  }
};

// 获取财务统计
const getFinanceStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // 简化版本 - 只获取基础计数
    const totalRecords = await FinanceRecord.count({ where: { userId } });
    const incomeCount = await FinanceRecord.count({ where: { userId, type: 'income' } });
    const expenseCount = await FinanceRecord.count({ where: { userId, type: 'expense' } });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          incomeCount,
          expenseCount,
          totalRecords
        },
        categoryStats: [],
        recentRecords: [],
        period: 'all'
      }
    });
    
  } catch (error) {
    console.error('Get finance stats error:', error);
    res.status(500).json({
      error: '获取财务统计失败',
      message: '服务器内部错误'
    });
  }
};

// 获取月度趋势数据
const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.userId;
    const { months = 12 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);
    
    const monthlyData = await FinanceRecord.findAll({
      where: {
        userId,
        recordDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('recordDate'), '%Y-%m'), 'month'],
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: [
        sequelize.fn('DATE_FORMAT', sequelize.col('recordDate'), '%Y-%m'),
        'type'
      ],
      order: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('recordDate'), '%Y-%m'), 'ASC']
      ],
      raw: true
    });
    
    // 组织数据格式
    const trendData = {};
    monthlyData.forEach(item => {
      if (!trendData[item.month]) {
        trendData[item.month] = { month: item.month, income: 0, expense: 0 };
      }
      trendData[item.month][item.type] = parseFloat(item.total);
    });
    
    const result = Object.values(trendData).map(item => ({
      ...item,
      balance: item.income - item.expense
    }));
    
    res.json({
      success: true,
      data: { trendData: result }
    });
    
  } catch (error) {
    console.error('Get monthly trend error:', error);
    res.status(500).json({
      error: '获取月度趋势失败',
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getFinanceRecords,
  getFinanceRecord,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  getFinanceCategories,
  createFinanceCategory,
  getFinanceStats,
  getMonthlyTrend
}; 