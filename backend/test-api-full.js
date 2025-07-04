const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let authToken = null;

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// 请求拦截器：自动添加token
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// 测试数据
const testUser = {
  username: 'testapi',
  email: 'test@api.com',
  password: '123456'
};

// 工具函数
function log(title, data = null) {
  console.log(`\n🔹 ${title}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function error(title, err) {
  console.log(`\n❌ ${title}`);
  console.log(err.response?.data || err.message);
}

// 用户认证测试
async function testAuth() {
  try {
    log('=== 🔐 用户认证测试 ===');
    
    // 注册用户
    try {
      const registerRes = await api.post('/auth/register', testUser);
      log('用户注册', registerRes.data);
    } catch (err) {
      if (err.response?.status === 400) {
        log('用户已存在，跳过注册');
      } else {
        throw err;
      }
    }
    
    // 用户登录
    const loginRes = await api.post('/auth/login', {
      username: testUser.username,
      password: testUser.password
    });
    log('用户登录', loginRes.data);
    
    authToken = loginRes.data.data.token;
    
    // 获取用户信息
    const userInfoRes = await api.get('/auth/user');
    log('获取用户信息', userInfoRes.data);
    
    return userInfoRes.data.data;
    
  } catch (err) {
    error('用户认证测试失败', err);
    throw err;
  }
}

// 财务管理测试
async function testFinance() {
  try {
    log('=== 💰 财务管理测试 ===');
    
    // 创建收入记录
    const incomeData = {
      amount: 5000,
      type: 'income',
      category: '工资',
      description: '月薪',
      date: '2024-01-15'
    };
    const incomeRes = await api.post('/finance', incomeData);
    log('创建收入记录', incomeRes.data);
    const incomeId = incomeRes.data.data.id;
    
    // 创建支出记录
    const expenseData = {
      amount: 1200,
      type: 'expense',
      category: '餐饮',
      description: '午餐',
      date: '2024-01-16'
    };
    const expenseRes = await api.post('/finance', expenseData);
    log('创建支出记录', expenseRes.data);
    const expenseId = expenseRes.data.data.id;
    
    // 获取财务记录列表
    const listRes = await api.get('/finance?page=1&limit=10');
    log('获取财务记录列表', listRes.data);
    
    // 获取单条记录
    const singleRes = await api.get(`/finance/${incomeId}`);
    log('获取单条记录', singleRes.data);
    
    // 更新记录
    const updateRes = await api.put(`/finance/${expenseId}`, {
      amount: 1500,
      description: '晚餐'
    });
    log('更新财务记录', updateRes.data);
    
    // 获取分类
    const categoriesRes = await api.get('/finance/categories/list?type=expense');
    log('获取支出分类', categoriesRes.data);
    
    // 获取统计
    const statsRes = await api.get('/finance/statistics/summary?period=month');
    log('获取财务统计', statsRes.data);
    
    return { incomeId, expenseId };
    
  } catch (err) {
    error('财务管理测试失败', err);
    throw err;
  }
}

// 任务管理测试
async function testTasks() {
  try {
    log('=== ✅ 任务管理测试 ===');
    
    // 创建任务
    const taskData = {
      title: '完成项目报告',
      description: '撰写年度项目总结报告',
      priority: 4,
      due_date: '2024-01-20'
    };
    const taskRes = await api.post('/tasks', taskData);
    log('创建任务', taskRes.data);
    const taskId = taskRes.data.data.id;
    
    // 创建第二个任务
    const task2Data = {
      title: '开会讨论',
      description: '团队例会',
      priority: 2,
      due_date: '2024-01-18'
    };
    const task2Res = await api.post('/tasks', task2Data);
    log('创建第二个任务', task2Res.data);
    const task2Id = task2Res.data.data.id;
    
    // 获取任务列表
    const listRes = await api.get('/tasks?page=1&limit=10&sortBy=priority&sortOrder=DESC');
    log('获取任务列表', listRes.data);
    
    // 获取单个任务
    const singleRes = await api.get(`/tasks/${taskId}`);
    log('获取单个任务', singleRes.data);
    
    // 更新任务状态
    const updateRes = await api.put(`/tasks/${taskId}`, {
      status: 'in_progress'
    });
    log('更新任务状态', updateRes.data);
    
    // 批量更新任务状态
    const batchRes = await api.patch('/tasks/batch/status', {
      taskIds: [taskId, task2Id],
      status: 'completed'
    });
    log('批量更新任务状态', batchRes.data);
    
    // 获取任务统计
    const statsRes = await api.get('/tasks/statistics/summary');
    log('获取任务统计', statsRes.data);
    
    // 获取今日任务
    const todayRes = await api.get('/tasks/today/list');
    log('获取今日任务', todayRes.data);
    
    return { taskId, task2Id };
    
  } catch (err) {
    error('任务管理测试失败', err);
    throw err;
  }
}

// 健康管理测试
async function testHealth() {
  try {
    log('=== 🏃‍♀️ 健康管理测试 ===');
    
    // 创建体重记录
    const weightData = {
      type: 'weight',
      value: 70.5,
      unit: 'kg',
      notes: '早晨测量',
      date: '2024-01-15'
    };
    const weightRes = await api.post('/health', weightData);
    log('创建体重记录', weightRes.data);
    const weightId = weightRes.data.data.id;
    
    // 创建睡眠记录
    const sleepData = {
      type: 'sleep',
      value: 7.5,
      unit: 'hours',
      notes: '睡眠质量良好',
      date: '2024-01-15'
    };
    const sleepRes = await api.post('/health', sleepData);
    log('创建睡眠记录', sleepRes.data);
    const sleepId = sleepRes.data.data.id;
    
    // 创建运动记录
    const exerciseData = {
      type: 'exercise',
      value: 45,
      unit: 'minutes',
      notes: '跑步',
      date: '2024-01-16'
    };
    const exerciseRes = await api.post('/health', exerciseData);
    log('创建运动记录', exerciseRes.data);
    const exerciseId = exerciseRes.data.data.id;
    
    // 获取健康记录列表
    const listRes = await api.get('/health?page=1&limit=10&type=weight');
    log('获取健康记录列表', listRes.data);
    
    // 获取单条记录
    const singleRes = await api.get(`/health/${weightId}`);
    log('获取单条记录', singleRes.data);
    
    // 更新记录
    const updateRes = await api.put(`/health/${weightId}`, {
      value: 70.2,
      notes: '晚上测量'
    });
    log('更新健康记录', updateRes.data);
    
    // 获取特定类型数据
    const typeRes = await api.get('/health/types/weight?limit=5');
    log('获取体重记录', typeRes.data);
    
    // 获取健康统计
    const statsRes = await api.get('/health/statistics/summary?period=week');
    log('获取健康统计', statsRes.data);
    
    // 获取趋势图表数据
    const trendsRes = await api.get('/health/charts/trends?period=month');
    log('获取健康趋势图表', trendsRes.data);
    
    // 获取今日健康数据
    const todayRes = await api.get('/health/today/summary');
    log('获取今日健康数据', todayRes.data);
    
    return { weightId, sleepId, exerciseId };
    
  } catch (err) {
    error('健康管理测试失败', err);
    throw err;
  }
}

// 仪表板数据测试
async function testDashboard() {
  try {
    log('=== 📊 仪表板数据测试 ===');
    
    // 获取仪表板数据
    const dashboardRes = await api.get('/dashboard');
    log('获取仪表板数据', dashboardRes.data);
    
    // 获取财务概览
    const financeOverviewRes = await api.get('/dashboard/finance-overview');
    log('获取财务概览', financeOverviewRes.data);
    
    // 获取任务概览
    const taskOverviewRes = await api.get('/dashboard/task-overview');
    log('获取任务概览', taskOverviewRes.data);
    
    // 获取健康概览
    const healthOverviewRes = await api.get('/dashboard/health-overview');
    log('获取健康概览', healthOverviewRes.data);
    
  } catch (err) {
    error('仪表板数据测试失败', err);
    throw err;
  }
}

// 清理测试数据
async function cleanupTestData(createdIds) {
  try {
    log('=== 🧹 清理测试数据 ===');
    
    // 删除财务记录
    if (createdIds.finance) {
      await api.delete(`/finance/${createdIds.finance.incomeId}`);
      await api.delete(`/finance/${createdIds.finance.expenseId}`);
      log('已删除财务记录');
    }
    
    // 删除任务
    if (createdIds.tasks) {
      await api.delete(`/tasks/${createdIds.tasks.taskId}`);
      await api.delete(`/tasks/${createdIds.tasks.task2Id}`);
      log('已删除任务记录');
    }
    
    // 删除健康记录
    if (createdIds.health) {
      await api.delete(`/health/${createdIds.health.weightId}`);
      await api.delete(`/health/${createdIds.health.sleepId}`);
      await api.delete(`/health/${createdIds.health.exerciseId}`);
      log('已删除健康记录');
    }
    
  } catch (err) {
    error('清理测试数据失败', err);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始API功能测试...\n');
  
  const createdIds = {};
  
  try {
    // 认证测试
    await testAuth();
    
    // 功能模块测试
    createdIds.finance = await testFinance();
    createdIds.tasks = await testTasks();
    createdIds.health = await testHealth();
    
    // 仪表板测试
    await testDashboard();
    
    console.log('\n✅ 所有API测试通过！');
    
    // 询问是否清理测试数据
    console.log('\n❓ 是否清理测试数据？(默认保留)');
    // await cleanupTestData(createdIds);
    
  } catch (err) {
    console.log('\n❌ 测试失败:', err.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 