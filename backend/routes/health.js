const express = require('express');
const router = express.Router();
const {
  getWeightRecords,
  getWeightRecord,
  createWeightRecord,
  updateWeightRecord,
  deleteWeightRecord,
  getHealthStats,
  getWeightTrend,
  calculateBMI,
  setHealthGoal
} = require('../controllers/healthController');
const { authenticate } = require('../middleware/auth');
const { validate, createWeightRecordSchema, updateWeightRecordSchema, calculateBMISchema } = require('../middleware/validation');

// 所有健康相关路由都需要认证
router.use(authenticate);

// 获取健康统计
router.get('/stats', getHealthStats);

// 获取体重趋势
router.get('/weight/trend', getWeightTrend);

// BMI计算工具
router.post('/bmi/calculate', validate(calculateBMISchema), calculateBMI);

// 设置健康目标
router.post('/goal', setHealthGoal);

// 获取体重记录列表
router.get('/weight', getWeightRecords);

// 创建体重记录
router.post('/weight', validate(createWeightRecordSchema), createWeightRecord);

// 获取单个体重记录
router.get('/weight/:id', getWeightRecord);

// 更新体重记录
router.put('/weight/:id', validate(updateWeightRecordSchema), updateWeightRecord);

// 删除体重记录
router.delete('/weight/:id', deleteWeightRecord);

// 运动记录（预留接口，暂时返回提示）
router.get('/exercise', (req, res) => {
  res.json({
    success: true,
    message: '运动记录功能开发中',
    data: []
  });
});

router.post('/exercise', (req, res) => {
  res.json({
    success: true,
    message: '运动记录功能开发中'
  });
});

// 睡眠记录（预留接口，暂时返回提示）
router.get('/sleep', (req, res) => {
  res.json({
    success: true,
    message: '睡眠记录功能开发中',
    data: []
  });
});

router.post('/sleep', (req, res) => {
  res.json({
    success: true,
    message: '睡眠记录功能开发中'
  });
});

module.exports = router; 