const { Task, TaskCategory, Project } = require('../models');
const { Op } = require('sequelize');

// 获取任务列表
const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      categoryId, 
      projectId,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = { userId: req.userId };
    
    // 添加筛选条件
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (projectId) where.projectId = projectId;
    
    // 搜索功能
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: TaskCategory,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: '获取任务列表失败',
      message: '服务器内部错误'
    });
  }
};

// 获取单个任务
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOne({
      where: { id, userId: req.userId },
      include: [
        {
          model: TaskCategory,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color', 'description']
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        error: '任务未找到',
        message: '指定的任务不存在'
      });
    }
    
    res.json({
      success: true,
      data: { task }
    });
    
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: '获取任务失败',
      message: '服务器内部错误'
    });
  }
};

// 创建任务
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.userId
    };
    
    // 验证分类是否属于当前用户
    if (taskData.categoryId) {
      const category = await TaskCategory.findOne({
        where: { id: taskData.categoryId, userId: req.userId }
      });
      if (!category) {
        return res.status(400).json({
          error: '创建任务失败',
          message: '指定的分类不存在'
        });
      }
    }
    
    // 验证项目是否属于当前用户
    if (taskData.projectId) {
      const project = await Project.findOne({
        where: { id: taskData.projectId, userId: req.userId }
      });
      if (!project) {
        return res.status(400).json({
          error: '创建任务失败',
          message: '指定的项目不存在'
        });
      }
    }
    
    const task = await Task.create(taskData);
    
    // 获取完整的任务信息（包含关联数据）
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: TaskCategory,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: '任务创建成功',
      data: { task: createdTask }
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: '创建任务失败',
      message: '服务器内部错误'
    });
  }
};

// 更新任务
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!task) {
      return res.status(404).json({
        error: '任务未找到',
        message: '指定的任务不存在'
      });
    }
    
    // 验证分类是否属于当前用户
    if (req.body.categoryId) {
      const category = await TaskCategory.findOne({
        where: { id: req.body.categoryId, userId: req.userId }
      });
      if (!category) {
        return res.status(400).json({
          error: '更新任务失败',
          message: '指定的分类不存在'
        });
      }
    }
    
    // 验证项目是否属于当前用户
    if (req.body.projectId) {
      const project = await Project.findOne({
        where: { id: req.body.projectId, userId: req.userId }
      });
      if (!project) {
        return res.status(400).json({
          error: '更新任务失败',
          message: '指定的项目不存在'
        });
      }
    }
    
    await task.update(req.body);
    
    // 获取更新后的完整任务信息
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: TaskCategory,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        }
      ]
    });
    
    res.json({
      success: true,
      message: '任务更新成功',
      data: { task: updatedTask }
    });
    
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: '更新任务失败',
      message: '服务器内部错误'
    });
  }
};

// 删除任务
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!task) {
      return res.status(404).json({
        error: '任务未找到',
        message: '指定的任务不存在'
      });
    }
    
    await task.destroy();
    
    res.json({
      success: true,
      message: '任务删除成功'
    });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: '删除任务失败',
      message: '服务器内部错误'
    });
  }
};

// 获取任务分类列表
const getCategories = async (req, res) => {
  try {
    const categories = await TaskCategory.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'ASC']]
    });
    
    res.json({
      success: true,
      data: { categories }
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: '获取分类列表失败',
      message: '服务器内部错误'
    });
  }
};

// 创建任务分类
const createCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      userId: req.userId
    };
    
    const category = await TaskCategory.create(categoryData);
    
    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: { category }
    });
    
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      error: '创建分类失败',
      message: '服务器内部错误'
    });
  }
};

// 获取项目列表
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: { projects }
    });
    
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: '获取项目列表失败',
      message: '服务器内部错误'
    });
  }
};

// 创建项目
const createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      userId: req.userId
    };
    
    const project = await Project.create(projectData);
    
    res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: { project }
    });
    
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: '创建项目失败',
      message: '服务器内部错误'
    });
  }
};

// 获取任务统计
const getTaskStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // 基础统计
    const totalTasks = await Task.count({ where: { userId } });
    const completedTasks = await Task.count({ 
      where: { userId, status: 'completed' } 
    });
    const pendingTasks = await Task.count({ 
      where: { userId, status: 'pending' } 
    });
    const inProgressTasks = await Task.count({ 
      where: { userId, status: 'in_progress' } 
    });
    
    // 按优先级统计
    const highPriorityTasks = await Task.count({ 
      where: { userId, priority: 'high' } 
    });
    const mediumPriorityTasks = await Task.count({ 
      where: { userId, priority: 'medium' } 
    });
    const lowPriorityTasks = await Task.count({ 
      where: { userId, priority: 'low' } 
    });
    
    // 过期任务
    const overdueTasks = await Task.count({
      where: {
        userId,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'completed' }
      }
    });
    
    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        highPriorityTasks,
        mediumPriorityTasks,
        lowPriorityTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
      }
    });
    
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      error: '获取任务统计失败',
      message: '服务器内部错误'
    });
  }
};

module.exports = {
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
}; 