# 军校学员个人生活助手 – 数据库项目验收说明文档

## 1. 项目概述
- **项目名称**：军校学员个人生活助手（Personal Life Management Assistant）  
- **目标定位**：为个人用户提供统一的任务、财务、健康、项目等多维度数据管理与分析能力。  
- **系统架构**：  
  - 前端：Vue 2 + Element-UI，负责交互与可视化。  
  - 后端：Node.js 14+、Express 4，负责业务逻辑及数据访问。  
  - 数据库：MySQL 5.7/8.0，采用 InnoDB 引擎。  

> 本文聚焦数据库层面的设计、实现与运维要点。

---

## 2. 数据库系统设计

### 2.1 选型与架构
| 组件 | 说明 |
| ---- | ---------------------------------------------------------------- |
| MySQL | 成熟稳定、事务支持完善；使用 InnoDB 以获得行级锁与外键支持。 |
| mysql2 | 后端使用 `mysql2/promise` 接口，提供原生 Promise 与连接池。 |
| 连接池 | 初始化时创建 `pool`，`connectionLimit` 默认为 10，可在 `.env` 中调整。 |
| 自动建库建表 | 首次启动时 `initDatabase()`：<br>① 检测并自动创建数据库；<br>② 按定义批量执行 `CREATE TABLE IF NOT EXISTS`；<br>③ 如检测到旧表缺失字段，则 `ALTER TABLE` 自动补列。 |

### 2.2 事务与一致性
- **业务层事务**：对多表写操作（如删除用户级联清理）通过 `START TRANSACTION` → `COMMIT / ROLLBACK` 保证一致性。
- **外键约束**：所有子表均以 `ON DELETE CASCADE` 引用 `users.id`，避免孤儿数据。
- **时间戳**：统一 `created_at`、`updated_at`；后者使用 `ON UPDATE CURRENT_TIMESTAMP` 自动维护。

---

## 3. E-R 模型（概念层）
```
User 1 ── n FinanceRecord
User 1 ── n FinanceBudget
User 1 ── n Task n ── 1 Project
User 1 ── n HealthRecord
User 1 ── n UserSetting
```
> 如需正式 ER 图，可使用 Navicat / MySQL Workbench 根据下述 DDL 反向生成。

---

## 4. 逻辑表结构

### 4.1 `users`
| 字段 | 类型 | 约束 | 备注 |
| ---- | ---- | ---- | ---- |
| `id` | INT | PK, AI | 用户主键 |
| `username` | VARCHAR(50) | UNIQUE | 登录名 |
| `email` | VARCHAR(100) | UNIQUE | 邮箱 |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt 加密后密码 |
| `avatar` | VARCHAR(255) |  | 头像 URL |
| `real_name` | VARCHAR(50) |  | 真实姓名 |
| `created_at / updated_at` | TIMESTAMP |  | |

### 4.2 `finance_records`
| 字段 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| `id` | INT | PK, AI | |
| `user_id` | INT | FK → users.id | |
| `amount` | DECIMAL(12,2) | NOT NULL | 金额 |
| `type` | ENUM('income','expense') | NOT NULL | 收入/支出 |
| `category` | VARCHAR(50) | NOT NULL | 分类 |
| `description` | TEXT |  | 备注 |
| `date` | DATE | NOT NULL | 发生日期 |
| `created_at / updated_at` | TIMESTAMP |  | |

### 4.3 `finance_budgets`
| 字段 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| `id` | INT | PK, AI | |
| `user_id` | INT | FK | |
| `month` | CHAR(7) | NOT NULL | `YYYY-MM` |
| `type` | ENUM('income','expense') | NOT NULL, 默认 `expense` | |
| `category` | VARCHAR(50) | NOT NULL | |
| `amount` | DECIMAL(12,2) | NOT NULL | 预算金额 |
| `note` | TEXT |  | 备注 |
| `created_at / updated_at` | TIMESTAMP |  | |
| 复合唯一 | `user_id+month+type+category` | 防止重复预算 |

### 4.4 `projects`
| 字段 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| `id` | INT | PK, AI | |
| `user_id` | INT | FK | |
| `name` | VARCHAR(100) | NOT NULL, Unique(user+name) | |
| `description` | TEXT | | |
| `status` | ENUM('active','completed','paused') | 默认 `active` | |
| `color` | VARCHAR(20) | 默认 `#409EFF` | 前端展示色 |

### 4.5 `tasks`
| 字段 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| `id` | INT | PK, AI | |
| `user_id` | INT | FK | |
| `project_id` | INT | 可空, FK → projects.id | |
| `title` | VARCHAR(200) | NOT NULL | |
| `description` | TEXT | | |
| `status` | ENUM('pending','in_progress','completed','cancelled') | 默认 `pending` | |
| `priority` | TINYINT | 1-5，默认 3 | |
| `due_date` | DATE | | 截止日期 |
| `created_at / updated_at` | TIMESTAMP | | |

### 4.6 `health_records`
| 字段 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| `id` | INT | PK, AI | |
| `user_id` | INT | FK | |
| `type` | VARCHAR(50) | NOT NULL | 如 weight / sleep |
| `value` | DECIMAL(8,2) | NOT NULL | 数值 |
| `height` | DECIMAL(5,2) | | 为 BMI 预留 |
| `unit` | VARCHAR(20) | | kg / h / step |
| `date` | DATE | NOT NULL | |
| `notes` | TEXT | | |
| `created_at / updated_at` | TIMESTAMP | | |

### 4.7 `user_settings`
| 字段 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| `id` | INT | PK, AI | |
| `user_id` | INT | FK | |
| `setting_key` | VARCHAR(50) | NOT NULL | 主题色、语言等 |
| `setting_value` | TEXT | | JSON 形式存储 |
| `created_at / updated_at` | TIMESTAMP | | |
| 唯一键 | `user_id + setting_key` | 单用户单键唯一 |

---

## 5. 典型业务流程
1. **注册 / 登录**  
   - `POST /api/auth/register` → 写入 `users`  
   - `POST /api/auth/login` → 返回 JWT  
2. **财务流水**  
   - 记账 → `POST /api/finance` 写 `finance_records`  
   - 获取本月统计 → `GET /api/finance?month=2024-05`，结合预算计算剩余  
3. **任务管理**  
   - 新建待办（今日）→ `POST /api/tasks`，`due_date = today`  
   - 批量切换完成状态 → `PUT /api/tasks/:id/toggle`  
4. **健康录入**  
   - 体重记录 → `POST /api/health` 保存 `health_records`  

---

## 6. 安全与性能
| 维度 | 方案 |
| ---- | --------------------------------------------------------------- |
| 身份认证 | JWT (`Authorization: Bearer <token>`) |
| 密码安全 | `bcryptjs` 10 轮加盐 |
| CORS | `.env` 中配置白名单 FRONTEND_URL |
| 防注入 | 所有 SQL 使用预编译占位符 |
| 性能优化 | 常用查询建索引；连接池复用；分页查询降低内存 |

---

## 7. 部署与运维
1. `.env` 管理端口、数据库、JWT 等敏感配置。  
2. 冷启动自动创建 / 更新表结构，降低人工成本。  
3. 备份：`mysqldump --single-transaction` 定时任务；关键表增量备份。  
4. 监控：`getPoolStatus()` 可暴露 API 供运维仪表盘使用。  

---

## 8. 测试与验收要点
| 测试项 | 验收标准 |
| ------ | ------------------------------------------------------------ |
| 表结构 | `SHOW CREATE TABLE` 结果与设计一致 |
| 数据完整性 | 删除用户时级联删除子表，无孤儿数据 |
| 并发写入 | 1000 并发记账无死锁，延时 < 200 ms |
| SQL 注入 | 注入测试不破坏数据 |
| 性能 | 查询半年财务记录 ≤ 100 ms |

---

## 9. 未来扩展
- 水平分表：按用户维度拆分 `finance_records`, `tasks`。
- 全文搜索：接入 ElasticSearch。
- 同步：规划本地 Lite DB 与云端双向同步。

---

## 10. 结论
该数据库设计遵循 3NF，充分利用外键与索引保证一致性与高效查询；启动脚本自动建表与升级，显著降低部署复杂度；配合连接池与参数化查询，可满足中小规模个人数据管理场景的可靠、可扩展需求。 