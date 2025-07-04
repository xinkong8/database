const express = require('express');
const { dbQuery, dbGet, dbRun } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取健康记录列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const sortBy = req.query.sortBy || 'date';
    const sortOrder = req.query.sortOrder || 'DESC';

    const offset = (page - 1) * limit;

    // 构建查询条件
    let sql = 'SELECT id, type, value, unit, notes, date, created_at, updated_at FROM health_records WHERE user_id = ?';
    let params = [userId];

    if (type && ['weight', 'sleep', 'exercise', 'water', 'mood'].includes(type)) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    // 验证排序字段
    const allowedSortFields = ['date', 'created_at', 'value'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    sql += ` ORDER BY ${validSortBy} ${validSortOrder}`;

    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM health_records WHERE user_id = ?';
    let countParams = [userId];

    if (type && ['weight', 'sleep', 'exercise', 'water', 'mood'].includes(type)) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }

    if (startDate) {
      countSql += ' AND date >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countSql += ' AND date <= ?';
      countParams.push(endDate);
    }

    const countResult = await dbGet(countSql, countParams);
    const total = countResult.total;

    // 添加分页 (MySQL 不支持 LIMIT/OFFSET 使用占位符)
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const records = await dbQuery(sql, params);

    res.json({
      success: true,
      message: '获取健康记录成功',
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
    console.error('获取健康记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取健康记录失败'
    });
  }
});

// 获取单条健康记录
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const recordId = parseInt(req.params.id);

    const record = await dbGet(
      'SELECT * FROM health_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '健康记录不存在'
      });
    }

    res.json({
      success: true,
      message: '获取健康记录成功',
      data: record
    });

  } catch (error) {
    console.error('获取健康记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取健康记录失败'
    });
  }
});

// 创建健康记录
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { type, value, unit, notes, date } = req.body;

    // 参数验证
    if (!type || !value || !date) {
      return res.status(400).json({
        success: false,
        message: '类型、数值和日期都是必填项'
      });
    }

    if (!['weight', 'sleep', 'exercise', 'water', 'mood'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '健康记录类型无效'
      });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return res.status(400).json({
        success: false,
        message: '数值必须是大于0的数字'
      });
    }

    // 根据类型设置默认单位
    let defaultUnit = unit;
    if (!unit) {
      switch (type) {
        case 'weight': defaultUnit = 'kg'; break;
        case 'sleep': defaultUnit = 'hours'; break;
        case 'exercise': defaultUnit = 'minutes'; break;
        case 'water': defaultUnit = 'ml'; break;
        case 'mood': defaultUnit = 'score'; break;
        default: defaultUnit = '';
      }
    }

    // 创建记录
    const result = await dbRun(
      'INSERT INTO health_records (user_id, type, value, unit, notes, date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, numValue, defaultUnit, notes || null, date]
    );

    // 获取创建的记录
    const newRecord = await dbGet(
      'SELECT * FROM health_records WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: '健康记录创建成功',
      data: newRecord
    });

  } catch (error) {
    console.error('创建健康记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建健康记录失败'
    });
  }
});

// 更新健康记录
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const recordId = parseInt(req.params.id);
    const { type, value, unit, notes, date } = req.body;

    // 检查记录是否存在且属于当前用户
    const existingRecord = await dbGet(
      'SELECT id FROM health_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: '健康记录不存在'
      });
    }

    // 构建更新语句
    let updateSql = 'UPDATE health_records SET updated_at = CURRENT_TIMESTAMP';
    let updateParams = [];

    if (type !== undefined) {
      if (!['weight', 'sleep', 'exercise', 'water', 'mood'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: '健康记录类型无效'
        });
      }
      updateSql += ', type = ?';
      updateParams.push(type);
    }

    if (value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return res.status(400).json({
          success: false,
          message: '数值必须是大于0的数字'
        });
      }
      updateSql += ', value = ?';
      updateParams.push(numValue);
    }

    if (unit !== undefined) {
      updateSql += ', unit = ?';
      updateParams.push(unit);
    }

    if (notes !== undefined) {
      updateSql += ', notes = ?';
      updateParams.push(notes);
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
      'SELECT * FROM health_records WHERE id = ?',
      [recordId]
    );

    res.json({
      success: true,
      message: '健康记录更新成功',
      data: updatedRecord
    });

  } catch (error) {
    console.error('更新健康记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新健康记录失败'
    });
  }
});

// 删除健康记录
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const recordId = parseInt(req.params.id);

    // 检查记录是否存在且属于当前用户
    const existingRecord = await dbGet(
      'SELECT id FROM health_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: '健康记录不存在'
      });
    }

    // 删除记录
    await dbRun(
      'DELETE FROM health_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );

    res.json({
      success: true,
      message: '健康记录删除成功'
    });

  } catch (error) {
    console.error('删除健康记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除健康记录失败'
    });
  }
});

// 获取健康统计
router.get('/statistics/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const period = req.query.period || 'week';

    let dateCondition = '';
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
        dateCondition = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
    }

    // 获取各类型统计
    const typeStats = await dbQuery(
      `SELECT 
        type, 
        COUNT(*) as \`count\`,
        AVG(value) as \`avgValue\`,
        MIN(value) as \`minValue\`,
        MAX(value) as \`maxValue\`
      FROM health_records 
      WHERE user_id = ? ${dateCondition}
      GROUP BY type`,
      [userId]
    );

    // 获取最新体重
    const latestWeight = await dbGet(
      `SELECT value FROM health_records 
      WHERE user_id = ? AND type = 'weight' 
      ORDER BY date DESC, created_at DESC 
      LIMIT 1`,
      [userId]
    );

    // 获取本周运动时长
    const weeklyExercise = await dbGet(
      `SELECT COALESCE(SUM(value), 0) as total 
      FROM health_records 
      WHERE user_id = ? AND type = 'exercise' 
      AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)`,
      [userId]
    );

    // 获取平均睡眠时长
    const avgSleep = await dbGet(
      `SELECT AVG(value) as average 
      FROM health_records 
      WHERE user_id = ? AND type = 'sleep' 
      AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)`,
      [userId]
    );

    res.json({
      success: true,
      message: '获取健康统计成功',
      data: {
        summary: {
          latestWeight: latestWeight?.value || null,
          weeklyExercise: parseFloat(weeklyExercise?.total || 0),
          avgSleep: parseFloat(avgSleep?.average || 0),
          period
        },
        typeStats: typeStats.map(stat => ({
          ...stat,
          avgValue: parseFloat(stat.avgValue || 0),
          minValue: parseFloat(stat.minValue || 0),
          maxValue: parseFloat(stat.maxValue || 0)
        }))
      }
    });

  } catch (error) {
    console.error('获取健康统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取健康统计失败'
    });
  }
});

// 获取特定类型的健康数据
router.get('/types/:type', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 30;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (!['weight', 'sleep', 'exercise', 'water', 'mood'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '健康记录类型无效'
      });
    }

    let sql = 'SELECT * FROM health_records WHERE user_id = ? AND type = ?';
    let params = [userId, type];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    const limitNum2 = parseInt(limit);
    sql += ` ORDER BY date DESC, created_at DESC LIMIT ${limitNum2}`;

    const records = await dbQuery(sql, params);

    res.json({
      success: true,
      message: `获取${type}记录成功`,
      data: records
    });

  } catch (error) {
    console.error(`获取${req.params.type}记录失败:`, error);
    res.status(500).json({
      success: false,
      message: `获取${req.params.type}记录失败`
    });
  }
});

// 获取今日健康数据
router.get('/today/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const todayRecords = await dbQuery(
      `SELECT type, value, unit, notes 
      FROM health_records 
      WHERE user_id = ? AND DATE(date) = CURDATE()
      ORDER BY created_at DESC`,
      [userId]
    );

    // 按类型分组
    const recordsByType = {};
    todayRecords.forEach(record => {
      if (!recordsByType[record.type]) {
        recordsByType[record.type] = [];
      }
      recordsByType[record.type].push(record);
    });

    res.json({
      success: true,
      message: '获取今日健康数据成功',
      data: {
        totalRecords: todayRecords.length,
        recordsByType
      }
    });

  } catch (error) {
    console.error('获取今日健康数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取今日健康数据失败'
    });
  }
});

// 获取健康趋势数据
router.get('/charts/trends', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { period = 'week', type } = req.query;

    // 处理时间范围条件
    let dateCondition = '';
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
        dateCondition = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
    }

    // 构建SQL
    let sql = `SELECT DATE(date) as date, type, SUM(value) as totalValue, AVG(value) as avgValue \n                FROM health_records \n                WHERE user_id = ? ${dateCondition}`;
    const params = [userId];

    if (type) {
      if (!['weight', 'sleep', 'exercise', 'water', 'mood'].includes(type)) {
        return res.status(400).json({ success: false, message: '健康记录类型无效' });
      }
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' GROUP BY DATE(date), type ORDER BY DATE(date) ASC';

    const trendData = await dbQuery(sql, params);

    res.json({
      success: true,
      message: '获取健康趋势成功',
      data: trendData
    });
  } catch (error) {
    console.error('获取健康趋势失败:', error);
    res.status(500).json({
      success: false,
      message: '获取健康趋势失败'
    });
  }
});

module.exports = router;