const express = require('express');
const { dbQuery, dbGet, dbRun } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取任务列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      startDate, 
      endDate,
      keyword,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['user_id = ?'];
    let params = [userId];

    // 构建查询条件
    if (status && ['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (priority && priority >= 1 && priority <= 5) {
      whereConditions.push('priority = ?');
      params.push(parseInt(priority));
    }

    if (startDate) {
      whereConditions.push('due_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('due_date <= ?');
      params.push(endDate);
    }

    if (keyword) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = whereConditions.join(' AND ');
    
    // 验证排序字段
    const allowedSortFields = ['created_at', 'updated_at', 'due_date', 'priority', 'title'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM tasks WHERE ${whereClause}`;
    const countResult = await dbGet(countSql, params);
    const total = countResult.total;

    // 解析并验证分页参数
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    // 获取任务列表 (MySQL 不支持 LIMIT/OFFSET 使用占位符)
    const sql = `
      SELECT id, title, description, status, priority, due_date, created_at, updated_at
      FROM tasks 
      WHERE ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const tasks = await dbQuery(sql, params);

    res.json({
      success: true,
      message: '获取任务列表成功',
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务列表失败'
    });
  }
});

// 获取单个任务
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    const task = await dbGet(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    res.json({
      success: true,
      message: '获取任务成功',
      data: task
    });

  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务失败'
    });
  }
});

// 创建任务
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, priority = 3, due_date } = req.body;

    // 参数验证
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '任务标题是必填项'
      });
    }

    if (priority < 1 || priority > 5) {
      return res.status(400).json({
        success: false,
        message: '优先级必须在1-5之间'
      });
    }

    // 创建任务
    const result = await dbRun(
      'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [userId, title.trim(), description || null, parseInt(priority), due_date || null]
    );

    // 获取创建的任务
    const newTask = await dbGet(
      'SELECT * FROM tasks WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: '任务创建成功',
      data: newTask
    });

  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({
      success: false,
      message: '创建任务失败'
    });
  }
});

// 更新任务
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;
    const { title, description, status, priority, due_date } = req.body;

    // 检查任务是否存在且属于当前用户
    const existingTask = await dbGet(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '任务标题不能为空'
        });
      }
      updateFields.push('title = ?');
      updateValues.push(title.trim());
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (status !== undefined) {
      if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: '任务状态无效'
        });
      }
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (priority !== undefined) {
      if (priority < 1 || priority > 5) {
        return res.status(400).json({
          success: false,
          message: '优先级必须在1-5之间'
        });
      }
      updateFields.push('priority = ?');
      updateValues.push(parseInt(priority));
    }

    if (due_date !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(due_date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(taskId, userId);

    // 更新任务
    await dbRun(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    // 获取更新后的任务
    const updatedTask = await dbGet(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    res.json({
      success: true,
      message: '任务更新成功',
      data: updatedTask
    });

  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({
      success: false,
      message: '更新任务失败'
    });
  }
});

// 删除任务
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const taskId = req.params.id;

    // 检查任务是否存在且属于当前用户
    const existingTask = await dbGet(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    // 删除任务
    await dbRun(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    res.json({
      success: true,
      message: '任务删除成功'
    });

  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({
      success: false,
      message: '删除任务失败'
    });
  }
});

// 批量更新任务状态
router.patch('/batch/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { taskIds, status } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '任务ID列表不能为空'
      });
    }

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '任务状态无效'
      });
    }

    // 构建批量更新SQL
    const placeholders = taskIds.map(() => '?').join(',');
    const sql = `
      UPDATE tasks 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders}) AND user_id = ?
    `;
    
    const params = [status, ...taskIds, userId];
    const result = await dbRun(sql, params);

    res.json({
      success: true,
      message: `成功更新${result.affectedRows}个任务状态`,
      data: {
        updatedCount: result.affectedRows
      }
    });

  } catch (error) {
    console.error('批量更新任务状态失败:', error);
    res.status(500).json({
      success: false,
      message: '批量更新任务状态失败'
    });
  }
});

// 获取任务统计
router.get('/statistics/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // 获取任务状态统计
    const statusStats = await dbQuery(
      `SELECT 
        status, 
        COUNT(*) as count
      FROM tasks 
      WHERE user_id = ?
      GROUP BY status`,
      [userId]
    );

    // 获取优先级统计
    const priorityStats = await dbQuery(
      `SELECT 
        priority, 
        COUNT(*) as count
      FROM tasks 
      WHERE user_id = ?
      GROUP BY priority
      ORDER BY priority DESC`,
      [userId]
    );

    // 获取今日任务
    const todayTasks = await dbQuery(
      `SELECT COUNT(*) as count
      FROM tasks 
      WHERE user_id = ? AND DATE(due_date) = CURDATE() AND status != 'completed'`,
      [userId]
    );

    // 获取过期任务
    const overdueTasks = await dbQuery(
      `SELECT COUNT(*) as count
      FROM tasks 
      WHERE user_id = ? AND due_date < CURDATE() AND status != 'completed' AND status != 'cancelled'`,
      [userId]
    );

    // 获取本周完成任务
    const weeklyCompleted = await dbQuery(
      `SELECT COUNT(*) as count
      FROM tasks 
      WHERE user_id = ? AND status = 'completed' 
      AND updated_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)`,
      [userId]
    );

    // 计算完成率
    const totalTasks = statusStats.reduce((sum, stat) => sum + stat.count, 0);
    const completedTasks = statusStats.find(stat => stat.status === 'completed')?.count || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      message: '获取任务统计成功',
      data: {
        summary: {
          total: totalTasks,
          completed: completedTasks,
          completionRate,
          todayTasks: todayTasks[0]?.count || 0,
          overdueTasks: overdueTasks[0]?.count || 0,
          weeklyCompleted: weeklyCompleted[0]?.count || 0
        },
        statusStats,
        priorityStats
      }
    });

  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务统计失败'
    });
  }
});

// 获取今日任务
router.get('/today/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const todayTasks = await dbQuery(
      `SELECT * FROM tasks 
      WHERE user_id = ? AND (
        DATE(due_date) = CURDATE() OR 
        (due_date IS NULL AND status != 'completed')
      )
      AND status != 'completed'
      ORDER BY priority DESC, created_at ASC`,
      [userId]
    );

    res.json({
      success: true,
      message: '获取今日任务成功',
      data: todayTasks
    });

  } catch (error) {
    console.error('获取今日任务失败:', error);
    res.status(500).json({
      success: false,
      message: '获取今日任务失败'
    });
  }
});

module.exports = router; 