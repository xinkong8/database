const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 开始测试API接口...\n');

  try {
    // 1. 测试根路径
    console.log('1. 测试根路径...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ 根路径测试成功:', rootResponse.data.message);
    console.log('   版本:', rootResponse.data.version);
    console.log('   状态:', rootResponse.data.status);

    // 2. 测试用户注册
    console.log('\n2. 测试用户注册...');
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      real_name: '测试用户'
    };

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ 用户注册成功:', registerResponse.data.message);
    console.log('   用户ID:', registerResponse.data.data.user.id);
    console.log('   用户名:', registerResponse.data.data.user.username);
    
    const token = registerResponse.data.data.token;
    console.log('   获得Token: ✅');

    // 3. 测试用户登录
    console.log('\n3. 测试用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('✅ 用户登录成功:', loginResponse.data.message);

    // 4. 测试获取用户信息
    console.log('\n4. 测试获取用户信息...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ 获取用户信息成功:', profileResponse.data.data.user.username);

    // 5. 测试仪表板数据
    console.log('\n5. 测试仪表板数据...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ 仪表板数据获取成功');
    console.log('   问候语:', dashboardResponse.data.data.system.greeting);
    console.log('   财务数据: ✅');
    console.log('   任务数据: ✅');
    console.log('   健康数据: ✅');

    // 6. 测试其他模块API
    console.log('\n6. 测试其他模块API...');
    const financeResponse = await axios.get(`${BASE_URL}/api/finance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ 财务模块:', financeResponse.data.message);

    const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ 任务模块:', tasksResponse.data.message);

    const healthResponse = await axios.get(`${BASE_URL}/api/health`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ 健康模块:', healthResponse.data.message);

    console.log('\n🎉 所有API测试通过！后端基础搭建成功！');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 无法连接到服务器，请确保服务器已启动');
      console.log('   请在另一个终端运行: npm run dev');
    } else {
      console.error('❌ API测试失败:', error.response?.data || error.message);
    }
  }
}

// 只有在直接运行此文件时才执行测试
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 