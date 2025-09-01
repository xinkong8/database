# 数据增删改查（CRUD）操作指南

> 本文针对军校学员个人生活助手项目，总结每个核心模块（用户、任务、财务、健康、项目、用户设置）的 **Create / Read / Update / Delete** 流程。阅读本章节可快速掌握如何在前后端层面完成数据的增删改查。

---

## 0. 通用约定

| 维度 | 规则 |
|------|------|
| 身份验证 | 前端在请求头携带 `Authorization: Bearer <JWT>`，后端 `authenticateToken` 中间件解析 `userId` 并写入 `req.userId`。 |
| 响应格式 | 统一 `{ success: boolean, message: string, data?: any }`，分页接口附带 `pagination` 对象。 |
| 数据隔离 | 所有业务表含 `user_id`，SQL 语句均以 `WHERE user_id = ?` 限定。 |
| 数据库调用 | `dbQuery` (SELECT)、`dbGet` (SELECT 1 行)、`dbRun` (INSERT / UPDATE / DELETE) 封装自 `mysql2/promise`。 |

---

## 1. 任务（`tasks` 表）

| 操作 | HTTP | 路径 | 主要参数 | SQL & 实现 |
|------|------|------|---------|-----------|
| 创建 | POST | `/api/tasks` | `title` `description?` `priority?` `due_date?` `project_id?` | `INSERT INTO tasks (user_id, title, …)` 使用 `dbRun` 返回 `insertId`，随后 `SELECT` 新记录；数据校验：标题非空、优先级 1-5。 |
| 查询列表 | GET | `/api/tasks` | `page` `limit` `status` `priority` `projectId` `keyword`… | 动态拼接 `WHERE` 条件，分页用 `LIMIT X OFFSET Y`；`COUNT(*)` 先求总量。 |
| 查询单条 | GET | `/api/tasks/:id` | - | `SELECT * FROM tasks WHERE id = ? AND user_id = ?`。 |
| 更新 | PUT | `/api/tasks/:id` | 可选字段同创建 | 检查归属后拼接 `SET field = ?` 字符串，执行 `UPDATE`。 |
| 删除 | DELETE | `/api/tasks/:id` | - | `DELETE FROM tasks WHERE id = ? AND user_id = ?`。 |

**前端示例（创建任务）**
```js
await request.post('/api/tasks', {
  title: '读完数据库课程',
  priority: 2,
  due_date: '2024-06-01'
});
```

---

## 2. 财务流水（`finance_records` 表）

| 操作 | HTTP | 路径 | 主要参数 | 说明 |
|------|------|------|---------|------|
| 创建 | POST | `/api/finance` | `amount` `type`(`income`/`expense`) `category` `date` `description?` | 插入后返回完整记录。 |
| 查询列表 | GET | `/api/finance` | `month` `type` `category` `page` `limit` ... | 支持按月份、类型、关键词过滤。 |
| 更新 | PUT | `/api/finance/:id` | 可选字段同创建 | 仅允许修改当前用户记录。 |
| 删除 | DELETE | `/api/finance/:id` | - | 直接物理删除。 |

---

## 3. 财务预算（`finance_budgets` 表）

| 操作 | HTTP | 路径 | 参数 | 特殊点 |
|------|------|------|------|--------|
| 创建/更新 | POST | `/api/finance/budget` | `month` `type` `category` `amount` | 借助 `ON DUPLICATE KEY UPDATE` 或先查后更，实现幂等。 |
| 列表 | GET | `/api/finance/budget?month=2024-05` | - | 返回当月所有预算。 |
| 删除 | DELETE | `/api/finance/budget/:id` | - | |  

---

## 4. 健康记录（`health_records` 表）

| 操作 | HTTP | 路径 | 参数 | 说明 |
|------|------|------|------|------|
| 创建 | POST | `/api/health` | `type` `value` `unit` `date` `notes?` `height?` | `value`、`type` 必填；`height` 可用于 BMI。 |
| 列表 | GET | `/api/health?type=weight&start=2024-01-01&end=2024-06-01` | - | 按时间范围与类型筛选，返回折线图所需数据。 |
| 更新 | PUT | `/api/health/:id` | 同创建 | |
| 删除 | DELETE | `/api/health/:id` | - | |

---

## 5. 项目管理（`projects` 表）

| 操作 | HTTP | 路径 | 参数 | 说明 |
|------|------|------|------|------|
| 创建 | POST | `/api/projects` | `name` `description?` `color?` | `name` 在同一用户下唯一。 |
| 列表 | GET | `/api/projects` | `status?` | 支持按状态过滤。 |
| 更新 | PUT | `/api/projects/:id` | `name` `description` `status` `color` | |
| 删除 | DELETE | `/api/projects/:id` | - | 删除项目时，可先将相关任务 `project_id` 置空或级联删除（视业务规则）。 |

---

## 6. 用户个性化设置（`user_settings` 表）

| 操作 | HTTP | 路径 | 参数 | 说明 |
|------|------|------|------|------|
| 设置/更新 | POST | `/api/settings` | `key` `value` | 若存在则更新，不存在则插入；利用复合唯一键保证一条记录。 |
| 获取全部 | GET | `/api/settings` | - | 返回当前用户所有键值对。 |
| 删除 | DELETE | `/api/settings/:key` | - | 按键删除。 |

---

## 7. 后端代码模板

所有增删改查都遵循以下模板：
```js
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    // 参数校验
    // INSERT / UPDATE / DELETE
    const result = await dbRun('SQL...', [params]);
    // 查询或拼装返回
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});
```

---

## 8. 前端调用封装

在 `src/utils/request.js` 创建 Axios 实例后，模块 API 文件（如 `src/api/task.js`）会这样写：
```js
import request from '@/utils/request';

export function createTask(data) {
  return request.post('/api/tasks', data);
}
export function getTasks(params) {
  return request.get('/api/tasks', { params });
}
// 其余同理
```
组件内直接 `await createTask(form);` 实现前端到数据库的整条链路。

---

## 9. 测试
- 单元测试：`tests/unit/utils/*.spec.js` 覆盖工具函数；对路由可写 **supertest** 用例确保 CRUD 行为符合预期。  
- 手动测试：使用 Postman/Thunder Client，先登录获取 Token，再调用各 REST API。  
- 集成测试：`npm run test:ci` = Lint + UnitTest，可在 CI 管道运行。

---

> 完成以上内容后，即可清晰了解项目中每张表/每个模块的增删改查流程及其前后端实现。希望对开发、测试、验收有所帮助！ 