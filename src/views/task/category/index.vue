<template>
  <div class="category-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">分类管理</h1>
        <p class="page-subtitle">管理您的任务分类标签</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
          添加分类
        </el-button>
      </div>
    </div>

    <!-- 分类列表 -->
    <el-card>
      <div slot="header" class="card-header">
        <span>分类列表 ({{ categories.length }})</span>
      </div>

      <div v-if="categories.length === 0" class="empty-state">
        <i class="el-icon-folder-add" />
        <p>暂无分类</p>
        <el-button type="primary" @click="showAddDialog = true">创建第一个分类</el-button>
      </div>

      <div v-else class="category-grid">
        <div
          v-for="category in categoriesWithStats"
          :key="category.id"
          class="category-card"
        >
          <div class="category-header">
            <div class="category-icon" :style="{ color: category.color }">
              <i :class="`el-icon-${category.icon}`" />
            </div>
            <div class="category-name">{{ category.name }}</div>
            <el-dropdown trigger="click" @command="handleCategoryAction">
              <span class="category-menu">
                <i class="el-icon-more" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="`edit_${category.id}`">
                  <i class="el-icon-edit" /> 编辑
                </el-dropdown-item>
                <el-dropdown-item :command="`duplicate_${category.id}`">
                  <i class="el-icon-document-copy" /> 复制
                </el-dropdown-item>
                <el-dropdown-item
                  :command="`delete_${category.id}`"
                  :disabled="category.id <= 5"
                  divided
                >
                  <i class="el-icon-delete" /> 删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-label">总任务</span>
              <span class="stat-value">{{ category.total }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已完成</span>
              <span class="stat-value completed">{{ category.completed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">待完成</span>
              <span class="stat-value remaining">{{ category.remaining }}</span>
            </div>
          </div>

          <div class="category-progress">
            <div class="progress-info">
              <span>完成进度</span>
              <span>{{ category.total > 0 ? Math.round((category.completed / category.total) * 100) : 0 }}%</span>
            </div>
            <el-progress
              :percentage="category.total > 0 ? Math.round((category.completed / category.total) * 100) : 0"
              :color="category.color"
              :stroke-width="8"
              :show-text="false"
            />
          </div>

          <div class="category-actions">
            <el-button
              size="small"
              type="text"
              @click="viewCategoryTasks(category)"
            >
              查看任务
            </el-button>
            <el-button
              size="small"
              type="text"
              @click="editCategory(category)"
            >
              编辑分类
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="500px">
      <el-form ref="categoryForm" :model="currentCategory" :rules="categoryRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="currentCategory.name"
            placeholder="请输入分类名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类图标" prop="icon">
          <el-select v-model="currentCategory.icon" placeholder="选择图标" style="width: 100%;">
            <el-option
              v-for="iconOption in iconOptions"
              :key="iconOption.value"
              :label="iconOption.label"
              :value="iconOption.value"
            >
              <span>
                <i :class="`el-icon-${iconOption.value}`" />
                {{ iconOption.label }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="分类颜色" prop="color">
          <div class="color-picker-container">
            <el-color-picker v-model="currentCategory.color" />
            <div class="color-presets">
              <div
                v-for="preset in colorPresets"
                :key="preset"
                class="color-preset"
                :style="{ backgroundColor: preset }"
                @click="currentCategory.color = preset"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">{{ isEditing ? '保存' : '添加' }}</el-button>
      </div>
    </el-dialog>

    <!-- 分类任务对话框 -->
    <el-dialog
      :title="`${selectedCategory ? selectedCategory.name : ''} - 任务列表`"
      :visible.sync="showTasksDialog"
      width="800px"
    >
      <div v-if="selectedCategory" class="category-tasks">
        <div class="tasks-header">
          <div class="category-info">
            <i :class="`el-icon-${selectedCategory.icon}`" :style="{ color: selectedCategory.color }" />
            <span class="category-name">{{ selectedCategory.name }}</span>
          </div>
          <div class="tasks-stats">
            <span>共 {{ categoryTasks.length }} 个任务</span>
          </div>
        </div>

        <div v-if="categoryTasks.length === 0" class="no-tasks">
          <p>该分类暂无任务</p>
          <el-button size="small" type="primary" @click="addTaskToCategory">添加任务</el-button>
        </div>

        <div v-else class="tasks-list">
          <div
            v-for="task in categoryTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.done }"
          >
            <el-checkbox v-model="task.done" @change="toggleTask(task.id)" />
            <div class="task-content">
              <span class="task-text" :class="{ done: task.done }">{{ task.text }}</span>
              <div class="task-meta">
                <el-tag v-if="task.priority !== 'medium'" size="mini" :type="getPriorityType(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </el-tag>
                <el-tag v-if="getProjectInfo(task.project)" size="mini" :color="getProjectInfo(task.project).color">
                  {{ getProjectInfo(task.project).name }}
                </el-tag>
              </div>
            </div>
            <div class="task-actions">
              <el-button type="text" size="small" @click="editTask(task)">编辑</el-button>
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
  name: 'CategoryManagement',
  data() {
    return {
      showDialog: false,
      showAddDialog: false,
      showTasksDialog: false,
      isEditing: false,
      selectedCategory: null,
      currentCategory: {
        name: '',
        icon: 'component',
        color: '#409EFF'
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '分类名称长度在1到20个字符', trigger: 'blur' }
        ],
        icon: [
          { required: true, message: '请选择分类图标', trigger: 'change' }
        ],
        color: [
          { required: true, message: '请选择分类颜色', trigger: 'change' }
        ]
      },
      iconOptions: [
        { value: 'user', label: '个人' },
        { value: 'suitcase', label: '工作' },
        { value: 'education', label: '学习' },
        { value: 'plus', label: '健康' },
        { value: 'star', label: '娱乐' },
        { value: 'home', label: '家庭' },
        { value: 'shopping-cart-full', label: '购物' },
        { value: 'car', label: '出行' },
        { value: 'money', label: '财务' },
        { value: 'phone', label: '社交' },
        { value: 'reading', label: '阅读' },
        { value: 'picture', label: '创作' }
      ],
      colorPresets: [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ]
    }
  },
  computed: {
    ...mapGetters('task', [
      'allCategories',
      'categoryStats',
      'allTodos',
      'allProjects'
    ]),
    categories() {
      return this.allCategories
    },
    categoriesWithStats() {
      return this.categoryStats
    },
    categoryTasks() {
      if (!this.selectedCategory) return []
      return this.allTodos.filter(todo => todo.category === this.selectedCategory.id)
    },
    dialogTitle() {
      return this.isEditing ? '编辑分类' : '添加分类'
    }
  },
  watch: {
    showAddDialog(val) {
      if (val) {
        this.showDialog = true
        this.isEditing = false
        this.resetCurrentCategory()
      }
    }
  },
  methods: {
    ...mapActions('task', [
      'addCategory',
      'updateCategory',
      'deleteCategory',
      'toggleTodo'
    ]),
    viewCategoryTasks(category) {
      this.selectedCategory = category
      this.showTasksDialog = true
    },
    editCategory(category) {
      this.isEditing = true
      this.currentCategory = { ...category }
      this.showDialog = true
    },
    async saveCategory() {
      this.$refs.categoryForm.validate(async(valid) => {
        if (valid) {
          try {
            if (this.isEditing) {
              await this.updateCategory({
                id: this.currentCategory.id,
                updates: this.currentCategory
              })
              this.$message.success('保存成功')
            } else {
              await this.addCategory(this.currentCategory)
              this.$message.success('添加成功')
            }
            this.showDialog = false
            this.resetCurrentCategory()
          } catch (error) {
            this.$message.error(this.isEditing ? '保存失败' : '添加失败')
          }
        }
      })
    },
    async handleCategoryAction(command) {
      const [action, categoryId] = command.split('_')
      const category = this.categories.find(c => c.id === parseInt(categoryId))

      switch (action) {
        case 'edit':
          this.editCategory(category)
          break
        case 'duplicate':
          await this.duplicateCategory(category)
          break
        case 'delete':
          await this.confirmDeleteCategory(category)
          break
      }
    },
    async duplicateCategory(category) {
      try {
        const newCategory = {
          ...category,
          name: `${category.name} (副本)`,
          id: undefined
        }
        delete newCategory.id
        await this.addCategory(newCategory)
        this.$message.success('分类复制成功')
      } catch (error) {
        this.$message.error('分类复制失败')
      }
    },
    async confirmDeleteCategory(category) {
      if (category.id <= 5) {
        this.$message.warning('系统默认分类不能删除')
        return
      }

      const taskCount = this.allTodos.filter(todo => todo.category === category.id).length
      let message = '确定要删除这个分类吗？'
      if (taskCount > 0) {
        message += `\n该分类包含 ${taskCount} 个任务，删除后任务将移至"个人"分类。`
      }

      this.$confirm(message, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await this.deleteCategory(category.id)
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    addTaskToCategory() {
      this.$router.push({
        path: '/task/todo',
        query: { category: this.selectedCategory.id }
      })
    },
    editTask(task) {
      this.$router.push({
        path: '/task/todo',
        query: { edit: task.id }
      })
    },
    async toggleTask(taskId) {
      try {
        await this.toggleTodo(taskId)
      } catch (error) {
        this.$message.error('操作失败')
      }
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
    getProjectInfo(projectId) {
      return this.allProjects.find(p => p.id === projectId)
    },
    resetCurrentCategory() {
      this.currentCategory = {
        name: '',
        icon: 'component',
        color: '#409EFF'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.category-management {
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .category-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .category-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(64, 158, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      i {
        font-size: 20px;
      }
    }

    .category-name {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .category-menu {
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

  .category-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #303133;

        &.completed {
          color: #67C23A;
        }

        &.remaining {
          color: #E6A23C;
        }
      }
    }
  }

  .category-progress {
    margin-bottom: 16px;

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }
  }

  .category-actions {
    display: flex;
    justify-content: space-between;
  }
}

.color-picker-container {
  display: flex;
  align-items: center;

  .color-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: 16px;

    .color-preset {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
        border-color: #409EFF;
      }
    }
  }
}

.category-tasks {
  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #EBEEF5;

    .category-info {
      display: flex;
      align-items: center;

      i {
        font-size: 20px;
        margin-right: 8px;
      }

      .category-name {
        font-size: 18px;
        font-weight: 600;
      }
    }

    .tasks-stats {
      font-size: 14px;
      color: #909399;
    }
  }

  .no-tasks {
    text-align: center;
    padding: 40px 0;
    color: #909399;

    p {
      margin: 0 0 16px 0;
    }
  }

  .tasks-list {
    .task-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      &.completed {
        opacity: 0.6;
      }

      .task-content {
        flex: 1;
        margin: 0 12px;

        .task-text {
          font-size: 16px;
          color: #303133;
          margin-bottom: 4px;
          display: block;

          &.done {
            text-decoration: line-through;
            color: #909399;
          }
        }

        .task-meta {
          display: flex;
          gap: 8px;
        }
      }

      .task-actions {
        display: flex;
        align-items: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .category-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }

  .color-picker-container {
    flex-direction: column;
    align-items: flex-start;

    .color-presets {
      margin-left: 0;
      margin-top: 8px;
    }
  }
}
</style>
