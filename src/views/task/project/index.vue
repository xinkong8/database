<template>
  <div class="project-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">项目管理</h1>
        <p class="page-subtitle">管理您的项目和查看项目进度</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
          新建项目
        </el-button>
      </div>
    </div>

    <!-- 项目统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :xs="12" :sm="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <i class="el-icon-folder" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ projects.length }}</div>
            <div class="stat-label">总项目</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <i class="el-icon-check" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ activeProjects.length }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <i class="el-icon-time" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalTasks() }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #F56C6C;">
            <i class="el-icon-star-on" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getAverageProgress() }}%</div>
            <div class="stat-label">平均进度</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 项目列表 -->
    <el-card>
      <div slot="header" class="card-header">
        <span>项目列表</span>
        <el-select v-model="statusFilter" size="small" style="width: 120px;">
          <el-option label="全部状态" value="all" />
          <el-option label="进行中" value="active" />
          <el-option label="已完成" value="completed" />
          <el-option label="已暂停" value="paused" />
        </el-select>
      </div>

      <div v-if="filteredProjects.length === 0" class="empty-state">
        <i class="el-icon-folder-opened" />
        <p>暂无项目</p>
        <el-button type="primary" @click="showAddDialog = true">创建第一个项目</el-button>
      </div>

      <div v-else class="project-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="viewProject(project)"
        >
          <div class="project-header">
            <div class="project-color" :style="{ backgroundColor: project.color }" />
            <div class="project-title">{{ project.name }}</div>
            <el-dropdown trigger="click" @command="handleProjectAction">
              <span class="project-menu">
                <i class="el-icon-more" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="`edit_${project.id}`">
                  <i class="el-icon-edit" /> 编辑
                </el-dropdown-item>
                <el-dropdown-item :command="`duplicate_${project.id}`">
                  <i class="el-icon-document-copy" /> 复制
                </el-dropdown-item>
                <el-dropdown-item :command="`delete_${project.id}`" divided>
                  <i class="el-icon-delete" /> 删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div class="project-description">{{ project.description || '暂无描述' }}</div>

          <div class="project-progress">
            <div class="progress-info">
              <span>进度</span>
              <span>{{ getProjectProgress(project.id) }}%</span>
            </div>
            <el-progress
              :percentage="getProjectProgress(project.id)"
              :color="project.color"
              :stroke-width="8"
              :show-text="false"
            />
          </div>

          <div class="project-stats">
            <div class="stat-item">
              <i class="el-icon-list" />
              <span>{{ getProjectTasks(project.id).length }} 任务</span>
            </div>
            <div class="stat-item">
              <i class="el-icon-check" />
              <span>{{ getCompletedTasks(project.id).length }} 已完成</span>
            </div>
          </div>

          <div class="project-footer">
            <div class="project-status">
              <el-tag
                :type="getStatusType(project.status)"
                size="mini"
              >
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>
            <div class="project-date">
              {{ formatDate(project.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新建/编辑项目对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="600px">
      <el-form ref="projectForm" :model="currentProject" :rules="projectRules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="currentProject.name"
            placeholder="请输入项目名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="项目描述">
          <el-input
            v-model="currentProject.description"
            type="textarea"
            placeholder="请输入项目描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="项目颜色" prop="color">
              <el-color-picker v-model="currentProject.color" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目状态" prop="status">
              <el-select v-model="currentProject.status" style="width: 100%;">
                <el-option label="进行中" value="active" />
                <el-option label="已完成" value="completed" />
                <el-option label="已暂停" value="paused" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProject">{{ isEditing ? '保存' : '创建' }}</el-button>
      </div>
    </el-dialog>

    <!-- 项目详情对话框 -->
    <el-dialog
      title="项目详情"
      :visible.sync="showDetailDialog"
      width="800px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedProject" class="project-detail">
        <div class="detail-header">
          <div class="project-info">
            <div class="project-name" :style="{ color: selectedProject.color }">
              {{ selectedProject.name }}
            </div>
            <div class="project-desc">{{ selectedProject.description || '暂无描述' }}</div>
          </div>
          <div class="project-actions">
            <el-button size="small" @click="addTaskToProject">添加任务</el-button>
            <el-button size="small" type="primary" @click="editProject(selectedProject)">编辑项目</el-button>
          </div>
        </div>

        <div class="detail-stats">
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="detail-stat">
                <div class="stat-value">{{ getProjectTasks(selectedProject.id).length }}</div>
                <div class="stat-label">总任务</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-stat">
                <div class="stat-value">{{ getCompletedTasks(selectedProject.id).length }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-stat">
                <div class="stat-value">{{ getProjectProgress(selectedProject.id) }}%</div>
                <div class="stat-label">完成度</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="project-tasks">
          <h4>项目任务</h4>
          <div v-if="getProjectTasks(selectedProject.id).length === 0" class="no-tasks">
            <p>暂无任务</p>
            <el-button size="small" type="primary" @click="addTaskToProject">添加第一个任务</el-button>
          </div>
          <div v-else class="task-list">
            <div
              v-for="task in getProjectTasks(selectedProject.id)"
              :key="task.id"
              class="task-item"
              :class="{ completed: task.done }"
            >
              <el-checkbox v-model="task.done" @change="toggleTask(task.id)" />
              <span class="task-text" :class="{ done: task.done }">{{ task.text }}</span>
              <el-tag v-if="task.priority !== 'medium'" size="mini" :type="getPriorityType(task.priority)">
                {{ getPriorityLabel(task.priority) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ProjectManagement',
  data() {
    return {
      statusFilter: 'all',
      showDialog: false,
      showAddDialog: false,
      showDetailDialog: false,
      isEditing: false,
      selectedProject: null,
      currentProject: {
        name: '',
        description: '',
        color: '#409EFF',
        status: 'active'
      },
      projectRules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { min: 1, max: 50, message: '项目名称长度在1到50个字符', trigger: 'blur' }
        ],
        color: [
          { required: true, message: '请选择项目颜色', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择项目状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('task', [
      'allProjects',
      'activeProjects',
      'allTodos',
      'projectProgress'
    ]),
    projects() {
      return this.allProjects
    },
    filteredProjects() {
      if (this.statusFilter === 'all') {
        return this.projects
      }
      return this.projects.filter(project => project.status === this.statusFilter)
    },
    dialogTitle() {
      return this.isEditing ? '编辑项目' : '新建项目'
    }
  },
  watch: {
    showAddDialog(val) {
      if (val) {
        this.showDialog = true
        this.isEditing = false
        this.resetCurrentProject()
      }
    }
  },
  methods: {
    ...mapActions('task', [
      'addProject',
      'updateProject',
      'deleteProject',
      'addTodo',
      'toggleTodo'
    ]),
    getTotalTasks() {
      return this.allTodos.length
    },
    getAverageProgress() {
      if (this.projects.length === 0) return 0
      const totalProgress = this.projects.reduce((sum, project) =>
        sum + this.getProjectProgress(project.id), 0
      )
      return Math.round(totalProgress / this.projects.length)
    },
    getProjectProgress(projectId) {
      return this.projectProgress(projectId)
    },
    getProjectTasks(projectId) {
      return this.allTodos.filter(todo => todo.project === projectId)
    },
    getCompletedTasks(projectId) {
      return this.allTodos.filter(todo => todo.project === projectId && todo.done)
    },
    getStatusType(status) {
      const statusMap = {
        active: 'success',
        completed: 'info',
        paused: 'warning'
      }
      return statusMap[status] || ''
    },
    getStatusText(status) {
      const statusMap = {
        active: '进行中',
        completed: '已完成',
        paused: '已暂停'
      }
      return statusMap[status] || status
    },
    getPriorityType(priority) {
      const typeMap = {
        low: 'info',
        medium: '',
        high: 'warning',
        urgent: 'danger'
      }
      return typeMap[priority] || ''
    },
    getPriorityLabel(priority) {
      const labelMap = {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急'
      }
      return labelMap[priority] || priority
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN')
    },
    viewProject(project) {
      this.selectedProject = project
      this.showDetailDialog = true
    },
    editProject(project) {
      this.isEditing = true
      this.currentProject = { ...project }
      this.showDialog = true
      this.showDetailDialog = false
    },
    async saveProject() {
      this.$refs.projectForm.validate(async(valid) => {
        if (valid) {
          try {
            if (this.isEditing) {
              await this.updateProject({
                id: this.currentProject.id,
                updates: this.currentProject
              })
              this.$message.success('保存成功')
            } else {
              await this.addProject(this.currentProject)
              this.$message.success('创建成功')
            }
            this.showDialog = false
            this.resetCurrentProject()
          } catch (error) {
            this.$message.error(this.isEditing ? '保存失败' : '创建失败')
          }
        }
      })
    },
    async handleProjectAction(command) {
      const [action, projectId] = command.split('_')
      const project = this.projects.find(p => p.id === parseInt(projectId))

      switch (action) {
        case 'edit':
          this.editProject(project)
          break
        case 'duplicate':
          await this.duplicateProject(project)
          break
        case 'delete':
          await this.confirmDeleteProject(project)
          break
      }
    },
    async duplicateProject(project) {
      try {
        const newProject = {
          ...project,
          name: `${project.name} (副本)`,
          id: undefined
        }
        delete newProject.id
        await this.addProject(newProject)
        this.$message.success('项目复制成功')
      } catch (error) {
        this.$message.error('项目复制失败')
      }
    },
    async confirmDeleteProject(project) {
      const taskCount = this.getProjectTasks(project.id).length
      let message = '确定要删除这个项目吗？'
      if (taskCount > 0) {
        message += `\n该项目包含 ${taskCount} 个任务，删除后任务将移出项目。`
      }

      this.$confirm(message, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await this.deleteProject(project.id)
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    addTaskToProject() {
      this.$router.push({
        path: '/task/todo',
        query: { project: this.selectedProject.id }
      })
    },
    async toggleTask(taskId) {
      try {
        await this.toggleTodo(taskId)
      } catch (error) {
        this.$message.error('操作失败')
      }
    },
    handleDetailClose() {
      this.showDetailDialog = false
      this.selectedProject = null
    },
    resetCurrentProject() {
      this.currentProject = {
        name: '',
        description: '',
        color: '#409EFF',
        status: 'active'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.project-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
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
      color: #303133;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;

  i {
    font-size: 64px;
    margin-bottom: 16px;
    display: block;
  }

  p {
    font-size: 16px;
    margin: 0 0 16px 0;
  }
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .project-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .project-color {
      width: 4px;
      height: 20px;
      border-radius: 2px;
      margin-right: 12px;
    }

    .project-title {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .project-menu {
      padding: 4px;
      border-radius: 4px;
      color: #909399;
      cursor: pointer;

      &:hover {
        background-color: #f5f7fa;
        color: #606266;
      }
    }
  }

  .project-description {
    color: #606266;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 16px;
    min-height: 40px;
  }

  .project-progress {
    margin-bottom: 16px;

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }
  }

  .project-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    .stat-item {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #909399;

      i {
        margin-right: 4px;
      }
    }
  }

  .project-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .project-date {
      font-size: 12px;
      color: #C0C4CC;
    }
  }
}

.project-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .project-info {
      flex: 1;

      .project-name {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .project-desc {
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .detail-stats {
    margin-bottom: 24px;

    .detail-stat {
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #303133;
        line-height: 1;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .project-tasks {
    h4 {
      margin: 0 0 16px 0;
      color: #303133;
    }

    .no-tasks {
      text-align: center;
      padding: 32px 0;
      color: #909399;

      p {
        margin: 0 0 16px 0;
      }
    }

    .task-list {
      .task-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
          border-bottom: none;
        }

        &.completed {
          opacity: 0.6;
        }

        .task-text {
          flex: 1;
          margin: 0 12px;

          &.done {
            text-decoration: line-through;
            color: #909399;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .project-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
