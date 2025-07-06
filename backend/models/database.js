const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'life_manager',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  charset: 'utf8mb4',
  waitForConnections: true,
  queueLimit: 0
};

// 创建连接池
let pool;

async function initDatabase() {
  try {
    console.log('🔧 开始连接MySQL数据库...');
    
    // 首先连接到MySQL服务器（不指定数据库）
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      charset: dbConfig.charset
    });

    // 创建数据库（如果不存在）
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 ${dbConfig.database} 创建/检查完成`);
    
    await tempConnection.end();

    // 创建连接池
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL连接池创建成功');

    // 测试连接
    const connection = await pool.getConnection();
    console.log('✅ MySQL数据库连接成功');
    connection.release();

    // 创建数据表
    await createTables();
    
    // 确保旧表新增列
    await ensureColumns();
    
    console.log('🎉 数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

// 创建数据表
async function createTables() {
  console.log('🔧 开始创建数据表...');

  const tables = [
    // 用户表
    {
      name: 'users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          avatar VARCHAR(255),
          real_name VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    },

    // 财务记录表
    {
      name: 'finance_records',
      sql: `
        CREATE TABLE IF NOT EXISTS finance_records (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          amount DECIMAL(12,2) NOT NULL,
          type ENUM('income', 'expense') NOT NULL,
          category VARCHAR(50) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_date (user_id, date),
          INDEX idx_type (type),
          INDEX idx_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    },

    // 任务表
    {
      name: 'tasks',
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          project_id INT DEFAULT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
          priority TINYINT DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
          due_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_status (user_id, status),
          INDEX idx_due_date (due_date),
          INDEX idx_project (project_id),
          INDEX idx_priority (priority)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    },

    // 健康记录表（包含 height 字段）
    {
      name: 'health_records',
      sql: `
        CREATE TABLE IF NOT EXISTS health_records (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          value DECIMAL(8,2) NOT NULL,
          height DECIMAL(5,2) DEFAULT NULL,
          unit VARCHAR(20),
          date DATE NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_type_date (user_id, type, date),
          INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    },

    // 用户设置表
    {
      name: 'user_settings',
      sql: `
        CREATE TABLE IF NOT EXISTS user_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          setting_key VARCHAR(50) NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_setting (user_id, setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    },

    // 财务预算表
    {
      name: 'finance_budgets',
      sql: `
        CREATE TABLE IF NOT EXISTS finance_budgets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          month CHAR(7) NOT NULL,
          type ENUM('income','expense') NOT NULL DEFAULT 'expense',
          category VARCHAR(50) NOT NULL,
          amount DECIMAL(12,2) NOT NULL,
          note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_user_month_cat (user_id, month, type, category),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_month (month),
          INDEX idx_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    },

    // 项目表
    {
      name: 'projects',
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          status ENUM('active','completed','paused') DEFAULT 'active',
          color VARCHAR(20) DEFAULT '#409EFF',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY uq_user_name (user_id, name),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    }
  ];

  for (const table of tables) {
    try {
      await pool.execute(table.sql);
      console.log(`✅ ${table.name}表创建成功`);
    } catch (error) {
      console.error(`❌ 创建${table.name}表失败:`, error.message);
      throw error;
    }
  }

  // 额外列检查：finance_budgets.type
  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM finance_budgets LIKE 'type'");
    if (rows.length === 0) {
      console.log('🔧 finance_budgets 缺少 type 列，正在自动添加...');
      await pool.execute("ALTER TABLE finance_budgets ADD COLUMN type ENUM('income','expense') NOT NULL DEFAULT 'expense' AFTER month");
      console.log('✅ type 列已添加');
    }
  } catch (err) {
    console.error('❌ 检查/添加 finance_budgets.type 列失败:', err.message);
    throw err;
  }

  // 额外列检查：tasks.project_id
  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM tasks LIKE 'project_id'");
    if (rows.length === 0) {
      console.log('🔧 tasks 缺少 project_id 列，正在自动添加...');
      await pool.execute("ALTER TABLE tasks ADD COLUMN project_id INT DEFAULT NULL AFTER priority");
      console.log('✅ project_id 列已添加');
    }
  } catch (err) {
    console.error('❌ 检查/添加 tasks.project_id 列失败:', err.message);
    throw err;
  }
}

// 数据库查询封装
const dbQuery = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
};

// 数据库执行封装（INSERT, UPDATE, DELETE）
const dbRun = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params);
    return {
      id: result.insertId,
      changes: result.affectedRows,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('数据库执行错误:', error);
    throw error;
  }
};

// 获取单条记录
const dbGet = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
};

// 获取连接池状态
const getPoolStatus = () => {
  if (!pool) return null;
  
  return {
    allConnections: pool.pool._allConnections.length,
    freeConnections: pool.pool._freeConnections.length,
    acquiringConnections: pool.pool._acquiringConnections.length
  };
};

// 关闭连接池
const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('✅ 数据库连接池已关闭');
  }
};

// 进程退出时关闭连接池
process.on('SIGINT', async () => {
  console.log('\n🔄 正在关闭数据库连接...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 正在关闭数据库连接...');
  await closePool();
  process.exit(0);
});

// 兼容老库：若 health_records 已存在但缺少 height 列则补列
async function ensureColumns() {
  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM health_records LIKE 'height'")
    if (rows.length === 0) {
      await pool.query("ALTER TABLE health_records ADD COLUMN height DECIMAL(5,2) DEFAULT NULL AFTER value")
      console.log('✅ health_records.height 列已补充')
    }
  } catch (err) {
    console.error('❌ 检查/添加 height 列失败:', err.message)
  }
}

// 初始化数据库
initDatabase();

module.exports = {
  pool,
  dbQuery,
  dbRun,
  dbGet,
  getPoolStatus,
  closePool
}; 