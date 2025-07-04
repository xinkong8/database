const express = require('express');
const router = express.Router();
const {
  getFinanceRecords,
  getFinanceRecord,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  getFinanceCategories,
  createFinanceCategory,
  getFinanceStats,
  getMonthlyTrend
} = require('../controllers/financeController');
const { authenticate } = require('../middleware/auth');
const { validate, createFinanceRecordSchema, updateFinanceRecordSchema, createFinanceCategorySchema } = require('../middleware/validation');

// 所有财务相关路由都需要认证
router.use(authenticate);

// 获取财务统计
router.get('/stats', getFinanceStats);

// 获取月度趋势
router.get('/trend', getMonthlyTrend);

// 获取财务分类
router.get('/categories', getFinanceCategories);

// 创建财务分类
router.post('/categories', validate(createFinanceCategorySchema), createFinanceCategory);

// 获取财务记录列表
router.get('/records', getFinanceRecords);

// 创建财务记录
router.post('/records', validate(createFinanceRecordSchema), createFinanceRecord);

// 获取单个财务记录
router.get('/records/:id', getFinanceRecord);

// 更新财务记录
router.put('/records/:id', validate(updateFinanceRecordSchema), updateFinanceRecord);

// 删除财务记录
router.delete('/records/:id', deleteFinanceRecord);

module.exports = router; 