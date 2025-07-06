const express = require('express');
const { dbQuery, dbGet, dbRun } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 获取项目列表
 * 支持分页、状态过滤、关键字搜索
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      page = 1,
      limit = 20,
      status,            // active/completed/paused
      keyword,           // 模糊搜索名称或描述
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClauses = ['user_id = ?'];
    const params = [userId];

    if (status && ['active', 'completed', 'paused'].includes(status)) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (keyword) {
      whereClauses.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const where = whereClauses.join(' AND ');

    const allowedSort = ['created_at', 'updated_at', 'name', 'status'];
    const orderField = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // total count
    const countSql = `SELECT COUNT(*) AS total FROM projects WHERE ${where}`;
    const total = (await dbGet(countSql, params)).total;

    // list with pagination (MySQL 占位符不支持 limit/offset)
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const listSql = `
      SELECT id, name, description, status, color, created_at, updated_at
      FROM projects
      WHERE ${where}
      ORDER BY ${orderField} ${orderDir}
      LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const projects = await dbQuery(listSql, params);

    res.json({
      success: true,
      message: '获取项目列表成功',
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('获取项目列表失败:', err);
    res.status(500).json({ success: false, message: '获取项目列表失败' });
  }
});

/**
 * 获取单个项目
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;

    const project = await dbGet('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
    if (!project) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }

    res.json({ success: true, message: '获取项目成功', data: project });
  } catch (err) {
    console.error('获取项目失败:', err);
    res.status(500).json({ success: false, message: '获取项目失败' });
  }
});

/**
 * 创建项目
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description = '', color = '#409EFF', status = 'active' } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: '项目名称不能为空' });
    }

    if (!['active', 'completed', 'paused'].includes(status)) {
      return res.status(400).json({ success: false, message: '项目状态无效' });
    }

    // 唯一性检查
    const existing = await dbGet('SELECT id FROM projects WHERE user_id = ? AND name = ?', [userId, name.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: '已存在同名项目' });
    }

    const result = await dbRun(
      'INSERT INTO projects (user_id, name, description, status, color) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), description, status, color]
    );

    const newProject = await dbGet('SELECT * FROM projects WHERE id = ?', [result.id]);

    res.status(201).json({ success: true, message: '项目创建成功', data: newProject });
  } catch (err) {
    console.error('创建项目失败:', err);
    res.status(500).json({ success: false, message: '创建项目失败' });
  }
});

/**
 * 更新项目
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;
    const { name, description, status, color } = req.body;

    // 检查存在
    const existing = await dbGet('SELECT id FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }

    // 构造更新
    const fields = [];
    const values = [];

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: '项目名称不能为空' });
      }
      fields.push('name = ?');
      values.push(name.trim());
    }

    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }

    if (status !== undefined) {
      if (!['active', 'completed', 'paused'].includes(status)) {
        return res.status(400).json({ success: false, message: '项目状态无效' });
      }
      fields.push('status = ?');
      values.push(status);
    }

    if (color !== undefined) {
      fields.push('color = ?');
      values.push(color);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: '没有提交任何更新字段' });
    }

    const updateSql = `UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    values.push(projectId, userId);

    await dbRun(updateSql, values);

    const updatedProject = await dbGet('SELECT * FROM projects WHERE id = ?', [projectId]);

    res.json({ success: true, message: '项目更新成功', data: updatedProject });
  } catch (err) {
    console.error('更新项目失败:', err);
    res.status(500).json({ success: false, message: '更新项目失败' });
  }
});

/**
 * 删除项目
 * 若删除项目，可选是否级联删除其任务，当前默认仅将 tasks.project_id 设为 NULL
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;

    const existing = await dbGet('SELECT id FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: '项目不存在' });
    }

    // 删除项目
    await dbRun('DELETE FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);

    // 将关联任务的 project_id 置空
    await dbRun('UPDATE tasks SET project_id = NULL WHERE project_id = ?', [projectId]);

    res.json({ success: true, message: '项目删除成功' });
  } catch (err) {
    console.error('删除项目失败:', err);
    res.status(500).json({ success: false, message: '删除项目失败' });
  }
});

module.exports = router; 