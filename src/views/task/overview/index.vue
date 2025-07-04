<template>
  <div class="task-overview">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-loading-text>正在加载任务概览...</el-loading-text>
      <i class="el-icon-loading" style="font-size: 40px; color: #409EFF;" />
    </div>

    <!-- 主要内容 -->
    <div v-else>
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">任务概览</h1>
        <p class="page-subtitle">全面了解您的任务完成情况</p>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" style="margin-bottom: 24px;">
        <el-col :xs="12" :sm="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <i class="el-icon-list" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ taskStats.total }}</div>
              <div class="stat-label">总任务</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card today">
            <div class="stat-icon">
              <i class="el-icon-calendar-today" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ taskStats.today }}</div>
              <div class="stat-label">今日待办</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card active">
            <div class="stat-icon">
              <i class="el-icon-loading" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ taskStats.active }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <i class="el-icon-check" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ taskStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 完成进度 -->
      <el-card class="progress-card" style="margin-bottom: 24px;">
        <div slot="header" class="card-header">
          <span>整体完成进度</span>
          <span class="progress-percentage">{{ taskStats.completionRate }}%</span>
        </div>
        <el-progress
          :percentage="taskStats.completionRate"
          :stroke-width="20"
          :show-text="false"
          class="progress-bar"
        />
        <div class="progress-details">
          <span>已完成 {{ taskStats.completed }} / {{ taskStats.total }} 个任务</span>
        </div>
      </el-card>

      <!-- 快速操作 -->
      <el-card style="margin-bottom: 24px;">
        <div slot="header" class="card-header">
          <span>快速操作</span>
        </div>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <el-button
              type="primary"
              icon="el-icon-plus"
              style="width: 100%;"
              @click="showAddTodoDialog = true"
            >
              添加待办事项
            </el-button>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-button
              type="success"
              icon="el-icon-folder-add"
              style="width: 100%;"
              @click="showAddProjectDialog = true"
            >
              新建项目
            </el-button>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-button
              type="info"
              icon="el-icon-view"
              style="width: 100%;"
              @click="$router.push('/task/todo')"
            >
              查看全部任务
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 项目进度 -->
      <el-card v-if="projects.length > 0" style="margin-bottom: 24px;">
        <div slot="header" class="card-header">
          <span>项目进度</span>
          <el-button type="text" @click="$router.push('/task/project')">查看全部</el-button>
        </div>
        <div class="project-list">
          <div v-for="project in projects" :key="project.id" class="project-item">
            <div class="project-info">
              <div class="project-name" :style="{ color: project.color }">{{ project.name }}</div>
              <div class="project-desc">{{ project.description }}</div>
            </div>
            <div class="project-progress">
              <el-progress
                :percentage="getProjectProgress(project.id)"
                :color="project.color"
                :stroke-width="8"
              />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 分类统计 -->
      <el-card>
        <div slot="header" class="card-header">
          <span>分类统计</span>
          <el-button type="text" @click="$router.push('/task/category')">管理分类</el-button>
        </div>
        <el-row :gutter="16">
          <el-col v-for="category in categoryStats" :key="category.id" :xs="12" :sm="8" :md="6">
            <div class="category-item">
              <div class="category-header">
                <i :class="`el-icon-${category.icon}`" :style="{ color: category.color }" />
                <span class="category-name">{{ category.name }}</span>
              </div>
              <div class="category-stats">
                <div class="category-count">{{ category.total }} 个任务</div>
                <div class="category-remaining">剩余 {{ category.remaining }} 个</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 添加待办事项对话框 -->
      <el-dialog
        title="添加待办事项"
        :visible.sync="showAddTodoDialog"
        width="500px"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        custom-class="optimized-dialog"
        @close="resetNewTodo"
      >
        <el-form :model="newTodo" label-width="80px">
          <el-form-item label="任务内容" required>
            <el-input v-model="newTodo.text" placeholder="请输入任务内容" />
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="newTodo.priority" style="width: 100%;">
              <el-option
                v-for="priority in priorities"
                :key="priority.value"
                :label="priority.label"
                :value="priority.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="newTodo.category" style="width: 100%;">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="项目">
            <el-select v-model="newTodo.project" clearable style="width: 100%;">
              <el-option
                v-for="project in projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker
              v-model="newTodo.dueDate"
              type="date"
              placeholder="选择截止日期"
              style="width: 100%;"
            />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="closeAddTodoDialog">取消</el-button>
          <el-button type="primary" @click="addTodo">确定</el-button>
        </div>
      </el-dialog>

      <!-- 添加项目对话框 -->
      <el-dialog
        title="新建项目"
        :visible.sync="showAddProjectDialog"
        width="500px"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        custom-class="optimized-dialog"
        @close="resetNewProject"
      >
        <el-form :model="newProject" label-width="80px">
          <el-form-item label="项目名称" required>
            <el-input v-model="newProject.name" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="项目描述">
            <el-input
              v-model="newProject.description"
              type="textarea"
              placeholder="请输入项目描述"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="项目颜色">
            <el-color-picker v-model="newProject.color" />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="closeAddProjectDialog">取消</el-button>
          <el-button type="primary" @click="addProject">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TaskOverview',
  data() {
    return {
      showAddTodoDialog: false,
      showAddProjectDialog: false,
      newTodo: {
        text: '',
        priority: 'medium',
        category: 1,
        project: null,
        dueDate: null
      },
      newProject: {
        name: '',
        description: '',
        color: '#409EFF'
      },
      loading: true
    }
  },
  computed: {
    ...mapGetters([
      'taskStats'
    ]),
    ...mapGetters('task', [
      'allProjects',
      'allCategories',
      'priorities',
      'categoryStats',
      'projectProgress'
    ]),
    projects() {
      return this.allProjects
    },
    categories() {
      return this.allCategories
    }
  },
  async created() {
    console.log('🚀 TaskOverview组件已创建，开始初始化数据...')
    await this.initializeData()
  },
  methods: {
    async initializeData() {
      try {
        console.log('📊 开始获取任务数据...')
        const tasksResponse = await this.$store.dispatch('task/fetchTasks')
        console.log('✅ 任务数据获取完成:', tasksResponse)

        console.log('📁 开始获取项目数据...')
        const projectsResponse = await this.$store.dispatch('task/fetchProjects')
        console.log('✅ 项目数据获取完成:', projectsResponse)

        console.log('🏷️ 开始获取分类数据...')
        const categoriesResponse = await this.$store.dispatch('task/fetchCategories')
        console.log('✅ 分类数据获取完成:', categoriesResponse)

        // 输出调试信息
        console.log('📈 任务统计:', this.taskStats)
        console.log('📂 项目列表:', this.projects)
        console.log('🏷️ 分类统计:', this.categoryStats)

        // 检查数据是否为空
        if (!this.taskStats) {
          console.warn('⚠️ taskStats为空，可能需要手动初始化')
        }
      } catch (error) {
        console.error('❌ 数据初始化失败:', error)

        // 更详细的错误信息
        if (error.code === 'NETWORK_ERROR') {
          this.$message.error('无法连接到服务器，请检查后端服务是否启动')
        } else if (error.response?.status === 401) {
          this.$message.error('身份验证失败，请重新登录')
          this.$router.push('/login')
        } else if (error.response?.status >= 500) {
          this.$message.error('服务器错误，请稍后重试')
        } else {
          this.$message.error(`数据加载失败: ${error.message || '未知错误'}`)
        }

        // 设置默认的空数据
        this.setDefaultData()
      } finally {
        this.loading = false
      }
    },

    setDefaultData() {
      // 如果API调用失败，设置一些默认数据以防止页面完全空白
      console.log('🔧 设置默认数据以避免页面空白')

      // 这里可以dispatch一些默认的空数据到store
      this.$store.commit('task/SET_TODOS', [])
      this.$store.commit('task/SET_PROJECTS', [])
      this.$store.commit('task/SET_CATEGORIES', [])
    },

    async addTodo() {
      if (!this.newTodo.text.trim()) {
        this.$message.warning('请输入任务内容')
        return
      }

      try {
        await this.$store.dispatch('task/addTodo', this.newTodo)
        this.$message.success('添加成功')
        this.closeAddTodoDialog()
      } catch (error) {
        this.$message.error('添加失败')
      }
    },

    async addProject() {
      if (!this.newProject.name.trim()) {
        this.$message.warning('请输入项目名称')
        return
      }

      try {
        await this.$store.dispatch('task/addProject', this.newProject)
        this.$message.success('项目创建成功')
        this.closeAddProjectDialog()
      } catch (error) {
        this.$message.error('创建失败')
      }
    },

    closeAddTodoDialog() {
      this.showAddTodoDialog = false
      this.resetNewTodo()
    },

    closeAddProjectDialog() {
      this.showAddProjectDialog = false
      this.resetNewProject()
    },

    getProjectProgress(projectId) {
      return this.projectProgress(projectId)
    },

    resetNewTodo() {
      this.newTodo = {
        text: '',
        priority: 'medium',
        category: 1,
        project: null,
        dueDate: null
      }
    },

    resetNewProject() {
      this.newProject = {
        name: '',
        description: '',
        color: '#409EFF'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.task-overview {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;

  .el-loading-text {
    margin-bottom: 20px;
    font-size: 16px;
    color: #606266;
  }
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  .page-subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;

    i {
      font-size: 24px;
      color: white;
    }
  }

  .stat-content {
    .stat-number {
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }

  &.total {
    .stat-icon {
      background: #409EFF;
    }
    .stat-number {
      color: #409EFF;
    }
  }

  &.today {
    .stat-icon {
      background: #E6A23C;
    }
    .stat-number {
      color: #E6A23C;
    }
  }

  &.active {
    .stat-icon {
      background: #67C23A;
    }
    .stat-number {
      color: #67C23A;
    }
  }

  &.completed {
    .stat-icon {
      background: #F56C6C;
    }
    .stat-number {
      color: #F56C6C;
    }
  }
}

.progress-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;

    .progress-percentage {
      font-size: 18px;
      font-weight: 600;
      color: #409EFF;
    }
  }

  .progress-bar {
    margin: 16px 0;
  }

  .progress-details {
    text-align: center;
    color: #909399;
    font-size: 14px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.project-list {
  .project-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      border-bottom: none;
    }

    .project-info {
      flex: 1;
      margin-right: 16px;

      .project-name {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .project-desc {
        font-size: 14px;
        color: #909399;
      }
    }

    .project-progress {
      width: 200px;
    }
  }
}

.category-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #EBEEF5;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .category-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    i {
      font-size: 18px;
      margin-right: 8px;
    }

    .category-name {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .category-stats {
    .category-count {
      font-size: 14px;
      color: #303133;
      margin-bottom: 4px;
    }

    .category-remaining {
      font-size: 12px;
      color: #909399;
    }
  }
}

@media (max-width: 768px) {
  .task-overview {
    padding: 16px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;

    .stat-icon {
      margin-right: 0;
      margin-bottom: 12px;
    }
  }
}
</style>
