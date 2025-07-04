const express = require('express');
const { dbQuery, dbGet, dbRun } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取财务记录列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const category = req.query.category;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const keyword = req.query.keyword;

    const offset = (page - 1) * limit;

    // 构建查询条件
    let sql = 'SELECT id, amount, type, category, description, date, created_at, updated_at FROM finance_records WHERE user_id = ?';
    let params = [userId];

    if (type && ['income', 'expense'].includes(type)) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    if (keyword) {
      sql += ' AND (description LIKE ? OR category LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM finance_records WHERE user_id = ?';
    let countParams = [userId];

    if (type && ['income', 'expense'].includes(type)) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }

    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    if (startDate) {
      countSql += ' AND date >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countSql += ' AND date <= ?';
      countParams.push(endDate);
    }

    if (keyword) {
      countSql += ' AND (description LIKE ? OR category LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    const countResult = await dbGet(countSql, countParams);
    const total = countResult.total;

    // 添加分页 (MySQL 不支持在服务器端预处理语句中使用占位符绑定 LIMIT/OFFSET)
    // limit 与 offset 已使用 parseInt 转为数字，避免 SQL 注入风险
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    const records = await dbQuery(sql, params);

    res.json({
      success: true,
      message: '获取财务记录成功',
      data: {
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取财务记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取财务记录失败'
    });
  }
});

// 获取单条财务记录
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const recordId = parseInt(req.params.id);

    const record = await dbGet(
      'SELECT * FROM finance_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '财务记录不存在'
      });
    }

    res.json({
      success: true,
      message: '获取财务记录成功',
      data: record
    });

  } catch (error) {
    console.error('获取财务记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取财务记录失败'
    });
  }
});

// 创建财务记录
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, type, category, description, date } = req.body;

    // 参数验证
    if (!amount || !type || !category || !date) {
      return res.status(400).json({
        success: false,
        message: '金额、类型、分类和日期都是必填项'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '类型必须是 income 或 expense'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须是大于0的数字'
      });
    }

    // 创建记录
    const result = await dbRun(
      'INSERT INTO finance_records (user_id, amount, type, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, numAmount, type, category, description || null, date]
    );

    // 获取创建的记录
    const newRecord = await dbGet(
      'SELECT * FROM finance_records WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: '财务记录创建成功',
      data: newRecord
    });

  } catch (error) {
    console.error('创建财务记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建财务记录失败'
    });
  }
});

// 更新财务记录
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const recordId = parseInt(req.params.id);
    const { amount, type, category, description, date } = req.body;

    // 检查记录是否存在且属于当前用户
    const existingRecord = await dbGet(
      'SELECT id FROM finance_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: '财务记录不存在'
      });
    }

    // 构建更新语句
    let updateSql = 'UPDATE finance_records SET updated_at = CURRENT_TIMESTAMP';
    let updateParams = [];

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: '金额必须是大于0的数字'
        });
      }
      updateSql += ', amount = ?';
      updateParams.push(numAmount);
    }

    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: '类型必须是 income 或 expense'
        });
      }
      updateSql += ', type = ?';
      updateParams.push(type);
    }

    if (category !== undefined) {
      updateSql += ', category = ?';
      updateParams.push(category);
    }

    if (description !== undefined) {
      updateSql += ', description = ?';
      updateParams.push(description);
    }

    if (date !== undefined) {
      updateSql += ', date = ?';
      updateParams.push(date);
    }

    if (updateParams.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段'
      });
    }

    updateSql += ' WHERE id = ? AND user_id = ?';
    updateParams.push(recordId, userId);

    // 更新记录
    await dbRun(updateSql, updateParams);

    // 获取更新后的记录
    const updatedRecord = await dbGet(
      'SELECT * FROM finance_records WHERE id = ?',
      [recordId]
    );

    res.json({
      success: true,
      message: '财务记录更新成功',
      data: updatedRecord
    });

  } catch (error) {
    console.error('更新财务记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新财务记录失败'
    });
  }
});

// 删除财务记录
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const recordId = parseInt(req.params.id);

    // 检查记录是否存在且属于当前用户
    const existingRecord = await dbGet(
      'SELECT id FROM finance_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: '财务记录不存在'
      });
    }

    // 删除记录
    await dbRun(
      'DELETE FROM finance_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    res.json({
      success: true,
      message: '财务记录删除成功'
    });

  } catch (error) {
    console.error('删除财务记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除财务记录失败'
    });
  }
});

// 获取财务分类
router.get('/categories/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.query;

    let sql = 'SELECT DISTINCT category FROM finance_records WHERE user_id = ?';
    let params = [userId];

    if (type && ['income', 'expense'].includes(type)) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY category';

    const categories = await dbQuery(sql, params);

    // 如果没有分类，返回默认分类
    if (categories.length === 0) {
      const defaultCategories = type === 'income' 
        ? ['工资', '奖金', '投资', '其他收入']
        : ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '房租', '其他支出'];
      
      res.json({
        success: true,
        message: '获取财务分类成功',
        data: defaultCategories.map(cat => ({ category: cat }))
      });
    } else {
      res.json({
        success: true,
        message: '获取财务分类成功',
        data: categories
      });
    }

  } catch (error) {
    console.error('获取财务分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取财务分类失败'
    });
  }
});

// 获取财务统计
router.get('/statistics/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const period = req.query.period || 'month';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let dateCondition = '';
    let params = [userId];

    if (startDate && endDate) {
      dateCondition = 'AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else {
      // 根据period设置日期条件
      switch (period) {
        case 'week':
          dateCondition = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
          break;
        case 'month':
          dateCondition = 'AND DATE_FORMAT(date, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")';
          break;
        case 'year':
          dateCondition = 'AND YEAR(date) = YEAR(NOW())';
          break;
        default:
          dateCondition = 'AND DATE_FORMAT(date, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")';
      }
    }

    // 获取收支统计
    const incomeResult = await dbGet(
      `SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = 'income' ${dateCondition}`,
      params
    );

    const expenseResult = await dbGet(
      `SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = 'expense' ${dateCondition}`,
      params
    );

    // 获取分类统计
    const categoryStats = await dbQuery(
      `SELECT 
        type, 
        category, 
        SUM(amount) as total,
        COUNT(*) as count
      FROM finance_records 
      WHERE user_id = ? ${dateCondition}
      GROUP BY type, category 
      ORDER BY total DESC`,
      params
    );

    // 获取每日统计（最近7天）
    const dailyStats = await dbQuery(
      `SELECT 
        DATE(date) as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM finance_records 
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(date)
      ORDER BY date ASC`,
      [userId]
    );

    const totalIncome = parseFloat(incomeResult.total || 0);
    const totalExpense = parseFloat(expenseResult.total || 0);
    const balance = totalIncome - totalExpense;

    res.json({
      success: true,
      message: '获取财务统计成功',
      data: {
        summary: {
          totalIncome,
          totalExpense,
          balance,
          period
        },
        categoryStats,
        dailyStats
      }
    });

  } catch (error) {
    console.error('获取财务统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取财务统计失败'
    });
  }
});

module.exports = router;