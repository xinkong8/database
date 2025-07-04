# 个人生活管理助手 - 数据库设计

## 📋 数据库设计概览

### 设计原则
1. **模块化设计** - 按功能模块划分表结构
2. **关联关系清晰** - 合理使用外键约束
3. **扩展性强** - 支持未来功能扩展
4. **数据完整性** - 保证数据一致性

## 📊 数据表设计

### 1. 用户管理模块

#### users - 用户表
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### user_settings - 用户设置表
```sql
CREATE TABLE user_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'zh-CN',
  notifications JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. 任务管理模块

#### task_categories - 任务分类表
```sql
CREATE TABLE task_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#409EFF',
  icon VARCHAR(50) DEFAULT 'list',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, name)
);
```

#### projects - 项目表
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  color VARCHAR(7) DEFAULT '#409EFF',
  status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### tasks - 任务表
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT DEFAULT NULL,
  project_id INT DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  due_date DATETIME DEFAULT NULL,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES task_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);
```

### 3. 财务管理模块

#### finance_categories - 财务分类表
```sql
CREATE TABLE finance_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  color VARCHAR(7) DEFAULT '#409EFF',
  icon VARCHAR(50) DEFAULT 'money',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_finance_category (user_id, name, type)
);
```

#### finance_records - 财务记录表
```sql
CREATE TABLE finance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  record_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES finance_categories(id) ON DELETE RESTRICT
);
```

#### budgets - 预算表
```sql
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT DEFAULT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period ENUM('monthly', 'quarterly', 'yearly') DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES finance_categories(id) ON DELETE SET NULL
);
```

### 4. 健康管理模块

#### weight_records - 体重记录表
```sql
CREATE TABLE weight_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  bmi DECIMAL(4,2) DEFAULT NULL,
  record_date DATE NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date_weight (user_id, record_date)
);
```

#### exercise_records - 运动记录表
```sql
CREATE TABLE exercise_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exercise_type VARCHAR(50) NOT NULL,
  duration INT NOT NULL COMMENT '运动时长(分钟)',
  calories INT DEFAULT NULL COMMENT '消耗卡路里',
  notes TEXT DEFAULT NULL,
  record_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### sleep_records - 睡眠记录表
```sql
CREATE TABLE sleep_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  sleep_time TIME NOT NULL,
  wake_time TIME NOT NULL,
  duration DECIMAL(4,2) NOT NULL COMMENT '睡眠时长(小时)',
  quality ENUM('poor', 'fair', 'good', 'excellent') DEFAULT 'good',
  notes TEXT DEFAULT NULL,
  record_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date_sleep (user_id, record_date)
);
```

#### health_metrics - 健康指标表
```sql
CREATE TABLE health_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  metric_type VARCHAR(50) NOT NULL COMMENT '指标类型：blood_pressure, heart_rate, blood_sugar等',
  value VARCHAR(50) NOT NULL,
  unit VARCHAR(20) DEFAULT NULL,
  record_date DATE NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔗 表关系说明

### 一对多关系
1. **users → user_settings** (1:1)
2. **users → task_categories** (1:N)
3. **users → projects** (1:N)
4. **users → tasks** (1:N)
5. **users → finance_categories** (1:N)
6. **users → finance_records** (1:N)
7. **users → budgets** (1:N)
8. **users → weight_records** (1:N)
9. **users → exercise_records** (1:N)
10. **users → sleep_records** (1:N)
11. **users → health_metrics** (1:N)
12. **task_categories → tasks** (1:N)
13. **projects → tasks** (1:N)
14. **finance_categories → finance_records** (1:N)
15. **finance_categories → budgets** (1:N)

## 📈 索引优化

### 主要索引
```sql
-- 任务表索引
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_category ON tasks(category_id);

-- 财务记录索引
CREATE INDEX idx_finance_records_user_date ON finance_records(user_id, record_date);
CREATE INDEX idx_finance_records_category ON finance_records(category_id);
CREATE INDEX idx_finance_records_type ON finance_records(type);

-- 健康记录索引
CREATE INDEX idx_weight_records_user_date ON weight_records(user_id, record_date);
CREATE INDEX idx_exercise_records_user_date ON exercise_records(user_id, record_date);
CREATE INDEX idx_sleep_records_user_date ON sleep_records(user_id, record_date);
CREATE INDEX idx_health_metrics_user_type ON health_metrics(user_id, metric_type);
```

## 🛡️ 数据完整性约束

1. **外键约束** - 保证引用完整性
2. **唯一约束** - 防止重复数据
3. **非空约束** - 确保必要字段
4. **枚举约束** - 限制字段值范围
5. **检查约束** - 数据有效性验证

## 📊 预计数据量

- **用户数据**: 小规模（< 10万用户）
- **任务数据**: 中等规模（每用户100-1000个任务）
- **财务数据**: 高频写入（每日多条记录）
- **健康数据**: 定期写入（每日1-5条记录） 