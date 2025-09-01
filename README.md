# 军校学员个人生活助手（Personal Life Management Assistant）

> 一个帮助您集中管理日常任务、财务、健康数据等信息的全栈应用。前端基于 **Vue 2 + Element-UI**，后端基于 **Node.js + Express + MySQL**，开箱即用。

---

## ✨ 功能特色

- **仪表盘**：今日概览、待办列表、快速操作入口
- **任务管理**：支持分类、项目、优先级、进度追踪
- **财务管理**：收支记录、预算、统计与可视化分析
- **健康中心**：体重、睡眠、运动等健康指标记录与趋势
- **项目管理**：创建项目并关联任务，查看项目进展
- **用户系统**：注册 / 登录 / JWT 认证、权限控制
- **响应式 UI**：桌面与移动端友好展示

> **提示**：后端首次启动时会自动创建数据库及所需数据表，无需手动执行 SQL 脚本。

---

## 🗂️ 目录结构

```text
root /
├─ backend/               # Node.js/Express 后端 API 代码
│  ├─ routes/             # 路由模块（auth / tasks / finance / health 等）
│  ├─ models/             # MySQL 连接与数据表初始化
│  ├─ middleware/         # 中间件（认证等）
│  └─ app.js              # 后端入口
├─ src/                   # 前端源码（Vue 2）
│  ├─ views/              # 业务页面
│  ├─ components/         # 通用组件
│  ├─ store/              # Vuex 状态管理
│  ├─ router/             # 前端路由
│  └─ utils/              # 工具方法
├─ tests/                 # Jest 单元测试
├─ public/                # 静态资源
└─ README.md              # 项目说明
```

---

## 🛠️ 技术栈

| 层级 | 主要技术 |
| ---- | --------------------------------------------- |
| 前端 | Vue 2 · Vue-Router · Vuex · Element-UI · Axios · ECharts |
| 后端 | Node.js · Express 4 · MySQL 8 · mysql2 · JWT · bcryptjs |
| 工具 | ESLint · Jest · Husky + lint-staged · Plop · SCSS |

---

## 🚀 快速开始

### 1. 环境准备

- Node.js ≥ 14
- npm ≥ 6
- MySQL ≥ 5.7（建议 8.0）
- Git

### 2. 克隆项目

```bash
git clone https://github.com/xinkong8/database.git
cd database        # 进入项目根目录
```

### 3. 配置后端环境变量

在 `backend` 目录下创建 `.env` 文件（与 `app.js` 同级）：

```ini
# 服务器
PORT=3000                  # 后端服务端口
FRONTEND_URL=http://localhost:8080

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=life_manager
DB_CONNECTION_LIMIT=10

# JWT
JWT_SECRET=your_jwt_secret
```

> `.env` 中的密码仅示例，请根据实际情况修改。

### 4. 安装依赖并启动

```bash
# 后端
cd backend
npm install          # 一次性安装所有后端依赖
npm run dev          # 开发模式（nodemon 热重载）
# 或 npm start       # 生产模式

# 前端（另起终端）
cd ..                # 回到项目根目录
npm install          # 安装前端依赖
npm run dev          # 启动开发服务器，默认 http://localhost:8080
```

首次运行后，访问 `http://localhost:8080` 即可体验全部功能。

### 5. 构建与部署

```bash
# 前端生产构建（生成 dist/）
npm run build:prod

# 后端生产启动（确保 .env 已正确配置）
cd backend && npm start
```

`dist` 目录可部署到任意静态资源服务器（如 Nginx、Netlify）或与后端结合部署。

### 6. 运行测试

```bash
npm run test:unit
```

---

## 📦 常用 npm Script

| 位置 | 命令 | 说明 |
| ---- | ------------------ | ------------------------ |
| 根目录 | `npm run dev` | 启动前端开发服务器 |
| 根目录 | `npm run build:prod` | 构建前端生产包 |
| 根目录 | `npm run lint` | 代码风格检查 / 自动修复 |
| backend | `npm run dev` | Nodemon 热重载启动后端 |
| backend | `npm start` | 生产模式启动后端 |

---

## 📝 贡献指南

1. Fork 仓库并新建分支：`git checkout -b feat/your-feature`。
2. 提交前请执行 `npm run lint` 通过 ESLint 检查。
3. 提交 PR 前请确保与 `restart-version` 分支保持同步。
4. 我们欢迎任何功能改进、Bug 修复或文档补充！

---

## 📄 许可证

本项目基于 **MIT License** 开源，详情见 `LICENSE` 文件。 