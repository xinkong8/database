const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getCategories,
  createCategory,
  getProjects,
  createProject,
  getTaskStats
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validate, createTaskSchema, updateTaskSchema, createTaskCategorySchema, createProjectSchema } = require('../middleware/validation');

// 所有任务相关路由都需要认证 - 应用认证中间件
router.use(authenticate);

// 获取任务统计
router.get('/stats', getTaskStats);

// 获取任务分类列表
router.get('/categories', getCategories);

// 创建任务分类
router.post('/categories', validate(createTaskCategorySchema), createCategory);

// 获取项目列表
router.get('/projects', getProjects);

// 创建项目
router.post('/projects', validate(createProjectSchema), createProject);

// 获取所有任务
router.get('/', getTasks);

// 创建新任务
router.post('/', validate(createTaskSchema), createTask);

// 获取单个任务
router.get('/:id', getTask);

// 更新任务
router.put('/:id', validate(updateTaskSchema), updateTask);

// 删除任务
router.delete('/:id', deleteTask);

module.exports = router; 