const express = require('express');
const { dbQuery, dbGet } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取仪表板概览数据
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式

    // 并行查询各种统计数据
    const [
      // 财务统计
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      recentFinanceRecords,
      
      // 任务统计
      totalTasks,
      completedTasks,
      pendingTasks,
      todayTasks,
      
      // 健康记录统计
      recentHealthRecords,
      todayHealthRecords
    ] = await Promise.all([
      // 财务数据
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "income"', [userId]),
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "expense"', [userId]),
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "income" AND DATE_FORMAT(date, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")', [userId]),
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "expense" AND DATE_FORMAT(date, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")', [userId]),
      dbQuery('SELECT * FROM finance_records WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 5', [userId]),
      
      // 任务数据
      dbGet('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [userId]),
      dbGet('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "completed"', [userId]),
      dbGet('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status IN ("pending", "in_progress")', [userId]),
      dbQuery('SELECT * FROM tasks WHERE user_id = ? AND (due_date = ? OR due_date IS NULL) AND status != "completed" ORDER BY priority DESC, created_at DESC LIMIT 5', [userId, today]),
      
      // 健康数据
      dbQuery('SELECT * FROM health_records WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 5', [userId]),
      dbQuery('SELECT * FROM health_records WHERE user_id = ? AND date = ? ORDER BY created_at DESC', [userId, today])
    ]);

    // 构建响应数据
    const dashboardData = {
      // 财务概览
      finance: {
        totalIncome: Number(totalIncome?.total || 0),
        totalExpense: Number(totalExpense?.total || 0),
        monthlyIncome: Number(monthlyIncome?.total || 0),
        monthlyExpense: Number(monthlyExpense?.total || 0),
        balance: Number(totalIncome?.total || 0) - Number(totalExpense?.total || 0),
        monthlyBalance: Number(monthlyIncome?.total || 0) - Number(monthlyExpense?.total || 0),
        recentRecords: recentFinanceRecords || []
      },

      // 任务概览
      tasks: {
        total: totalTasks?.count || 0,
        completed: completedTasks?.count || 0,
        pending: pendingTasks?.count || 0,
        completionRate: totalTasks?.count > 0 ? Math.round((completedTasks?.count / totalTasks?.count) * 100) : 0,
        todayTasks: todayTasks || []
      },

      // 健康概览
      health: {
        recentRecords: recentHealthRecords || [],
        todayRecords: todayHealthRecords || [],
        recordsCount: recentHealthRecords?.length || 0
      },

      // 系统信息
      system: {
        currentDate: today,
        lastUpdateTime: new Date().toISOString(),
        greeting: getGreeting()
      }
    };

    res.json({
      success: true,
      message: '获取仪表板数据成功',
      data: dashboardData
    });

  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取仪表板数据失败'
    });
  }
});

// 获取最近7天的数据趋势
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // 获取最近7天的财务数据
    const financeData = await dbQuery(`
      SELECT 
        DATE(date) as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM finance_records 
      WHERE user_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(date)
      ORDER BY date ASC
    `, [userId]);

    // 获取最近7天的任务完成情况
    const taskData = await dbQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks 
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [userId]);

    // 获取最近7天的健康记录数量
    const healthData = await dbQuery(`
      SELECT 
        DATE(date) as date,
        COUNT(*) as records
      FROM health_records 
      WHERE user_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(date)
      ORDER BY date ASC
    `, [userId]);

    res.json({
      success: true,
      message: '获取趋势数据成功',
      data: {
        finance: financeData || [],
        tasks: taskData || [],
        health: healthData || []
      }
    });

  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取趋势数据失败'
    });
  }
});

// 快速统计接口
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const stats = await Promise.all([
      // 本月财务统计
      dbGet('SELECT COUNT(*) as count FROM finance_records WHERE user_id = ? AND DATE_FORMAT(date, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")', [userId]),
      // 今日任务
      dbGet('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND DATE(due_date) = CURDATE() AND status != "completed"', [userId]),
      // 本周健康记录
      dbGet('SELECT COUNT(*) as count FROM health_records WHERE user_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 7 DAY)', [userId])
    ]);

    res.json({
      success: true,
      data: {
        monthlyFinanceRecords: stats[0]?.count || 0,
        todayTasks: stats[1]?.count || 0,
        weeklyHealthRecords: stats[2]?.count || 0
      }
    });

  } catch (error) {
    console.error('获取快速统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

// ========================= 财务概览 =========================
router.get('/finance-overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    const [
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      recentFinanceRecords
    ] = await Promise.all([
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "income"', [userId]),
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "expense"', [userId]),
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "income" AND DATE_FORMAT(date, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")', [userId]),
      dbGet('SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE user_id = ? AND type = "expense" AND DATE_FORMAT(date, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")', [userId]),
      dbQuery('SELECT * FROM finance_records WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 5', [userId])
    ]);

    res.json({
      success: true,
      message: '获取财务概览成功',
      data: {
        totalIncome: Number(totalIncome?.total || 0),
        totalExpense: Number(totalExpense?.total || 0),
        monthlyIncome: Number(monthlyIncome?.total || 0),
        monthlyExpense: Number(monthlyExpense?.total || 0),
        balance: Number(totalIncome?.total || 0) - Number(totalExpense?.total || 0),
        monthlyBalance: Number(monthlyIncome?.total || 0) - Number(monthlyExpense?.total || 0),
        recentRecords: recentFinanceRecords || []
      }
    });
  } catch (error) {
    console.error('获取财务概览失败:', error);
    res.status(500).json({ success: false, message: '获取财务概览失败' });
  }
});

// ========================= 任务概览 =========================
router.get('/task-overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    const [ totalTasks, completedTasks, pendingTasks, todayTasks ] = await Promise.all([
      dbGet('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [userId]),
      dbGet('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "completed"', [userId]),
      dbGet('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status IN ("pending", "in_progress")', [userId]),
      dbQuery('SELECT * FROM tasks WHERE user_id = ? AND (due_date = ? OR due_date IS NULL) AND status != "completed" ORDER BY priority DESC, created_at DESC LIMIT 5', [userId, today])
    ]);

    res.json({
      success: true,
      message: '获取任务概览成功',
      data: {
        total: totalTasks?.count || 0,
        completed: completedTasks?.count || 0,
        pending: pendingTasks?.count || 0,
        completionRate: totalTasks?.count ? Math.round((completedTasks?.count / totalTasks?.count) * 100) : 0,
        todayTasks: todayTasks || []
      }
    });
  } catch (error) {
    console.error('获取任务概览失败:', error);
    res.status(500).json({ success: false, message: '获取任务概览失败' });
  }
});

// ========================= 健康概览 =========================
router.get('/health-overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    const [ recentHealthRecords, todayHealthRecords ] = await Promise.all([
      dbQuery('SELECT * FROM health_records WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 5', [userId]),
      dbQuery('SELECT * FROM health_records WHERE user_id = ? AND date = ? ORDER BY created_at DESC', [userId, today])
    ]);

    res.json({
      success: true,
      message: '获取健康概览成功',
      data: {
        recentRecords: recentHealthRecords || [],
        todayRecords: todayHealthRecords || [],
        recordsCount: recentHealthRecords?.length || 0
      }
    });
  } catch (error) {
    console.error('获取健康概览失败:', error);
    res.status(500).json({ success: false, message: '获取健康概览失败' });
  }
});

// 根据时间获取问候语
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

module.exports = router; 