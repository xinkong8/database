<template>
  <div class="todo-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">待办事项</h1>
        <p class="page-subtitle">管理您的所有待办任务</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
          添加任务
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索栏 -->
    <el-card class="filter-card" style="margin-bottom: 24px;">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="6">
          <el-select v-model="filter.status" placeholder="状态筛选" @change="updateFilter">
            <el-option label="全部" value="all" />
            <el-option label="未完成" value="active" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="filter.priority" placeholder="优先级筛选" @change="updateFilter">
            <el-option label="全部优先级" value="all" />
            <el-option
              v-for="priority in priorities"
              :key="priority.value"
              :label="priority.label"
              :value="priority.value"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="filter.category" placeholder="分类筛选" @change="updateFilter">
            <el-option label="全部分类" value="all" />
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="filter.project" placeholder="项目筛选" @change="updateFilter">
            <el-option label="全部项目" value="all" />
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-col>
      </el-row>

      <el-row style="margin-top: 16px;">
        <el-col :span="24">
          <el-input
            v-model="searchText"
            placeholder="搜索任务内容..."
            prefix-icon="el-icon-search"
            clearable
            @input="handleSearch"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 批量操作栏 -->
    <div v-if="selectedTodos.length > 0" class="batch-actions">
      <el-alert :title="`已选择 ${selectedTodos.length} 个任务`" type="info" show-icon>
        <template slot="default">
          <el-button size="small" @click="batchComplete">批量完成</el-button>
          <el-button size="small" @click="batchDelete">批量删除</el-button>
          <el-button size="small" @click="selectedTodos = []">取消选择</el-button>
        </template>
      </el-alert>
    </div>

    <!-- 任务列表 -->
    <el-card class="todo-list-card">
      <div slot="header" class="list-header">
        <span>任务列表 ({{ filteredTodos.length }})</span>
        <div class="list-actions">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          <el-button
            type="text"
            icon="el-icon-refresh"
            :disabled="completedTodos.length === 0"
            @click="clearCompleted"
          >
            清除已完成
          </el-button>
        </div>
      </div>

      <div v-if="filteredTodos.length === 0" class="empty-state">
        <i class="el-icon-document-checked" />
        <p>暂无任务</p>
      </div>

      <div v-else class="todo-list">
        <div
          v-for="todo in paginatedTodos"
          :key="todo.id"
          class="todo-item"
          :class="{ completed: todo.done }"
        >
          <div class="todo-checkbox">
            <el-checkbox
              v-model="selectedTodos"
              :label="todo.id"
            />
          </div>

          <div class="todo-status">
            <el-checkbox
              v-model="todo.done"
              size="large"
              @change="toggleTodo(todo.id)"
            />
          </div>

          <div class="todo-content" @click="editTodo(todo)">
            <div class="todo-text" :class="{ done: todo.done }">
              {{ todo.text }}
            </div>
            <div class="todo-meta">
              <el-tag
                v-if="getPriorityInfo(todo.priority)"
                :color="getPriorityInfo(todo.priority).color"
                size="mini"
                effect="light"
              >
                {{ getPriorityInfo(todo.priority).label }}
              </el-tag>
              <el-tag
                v-if="getCategoryInfo(todo.category)"
                :color="getCategoryInfo(todo.category).color"
                size="mini"
                effect="light"
              >
                <i :class="`el-icon-${getCategoryInfo(todo.category).icon}`" />
                {{ getCategoryInfo(todo.category).name }}
              </el-tag>
              <el-tag
                v-if="getProjectInfo(todo.project)"
                :color="getProjectInfo(todo.project).color"
                size="mini"
                effect="light"
              >
                {{ getProjectInfo(todo.project).name }}
              </el-tag>
              <span v-if="todo.dueDate" class="due-date" :class="{ overdue: isOverdue(todo.dueDate) }">
                <i class="el-icon-calendar" />
                {{ formatDate(todo.dueDate) }}
              </span>
            </div>
          </div>

          <div class="todo-actions">
            <el-button
              type="text"
              icon="el-icon-edit"
              title="编辑"
              @click="editTodo(todo)"
            />
            <el-button
              type="text"
              icon="el-icon-delete"
              title="删除"
              style="color: #f56c6c;"
              @click="deleteTodo(todo.id)"
            />
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="filteredTodos.length > pageSize"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredTodos.length"
        layout="prev, pager, next"
        style="text-align: center; margin-top: 24px;"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 添加/编辑任务对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="600px">
      <el-form ref="todoForm" :model="currentTodo" :rules="todoRules" label-width="100px">
        <el-form-item label="任务内容" prop="text">
          <el-input
            v-model="currentTodo.text"
            placeholder="请输入任务内容"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="currentTodo.priority" style="width: 100%;">
                <el-option
                  v-for="priority in priorities"
                  :key="priority.value"
                  :label="priority.label"
                  :value="priority.value"
                >
                  <span :style="{ color: priority.color }">{{ priority.label }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="currentTodo.category" style="width: 100%;">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                >
                  <span :style="{ color: category.color }">
                    <i :class="`el-icon-${category.icon}`" />
                    {{ category.name }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属项目">
              <el-select v-model="currentTodo.project" clearable style="width: 100%;">
                <el-option
                  v-for="project in projects"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                >
                  <span :style="{ color: project.color }">{{ project.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期">
              <el-date-picker
                v-model="currentTodo.dueDate"
                type="date"
                placeholder="选择截止日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input
            v-model="currentTodo.note"
            type="textarea"
            placeholder="添加备注信息（可选）"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTodo">{{ isEditing ? '保存' : '添加' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TodoManagement',
  data() {
    return {
      searchText: '',
      selectedTodos: [],
      showDialog: false,
      showAddDialog: false,
      isEditing: false,
      currentPage: 1,
      pageSize: 10,
      currentTodo: {
        text: '',
        priority: 'medium',
        category: 1,
        project: null,
        dueDate: null,
        note: ''
      },
      todoRules: {
        text: [
          { required: true, message: '请输入任务内容', trigger: 'blur' },
          { min: 1, max: 200, message: '任务内容长度在1到200个字符', trigger: 'blur' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('task', [
      'filteredTodos',
      'allProjects',
      'allCategories',
      'priorities',
      'completedTodos'
    ]),
    filter: {
      get() {
        return this.$store.state.task.filter
      },
      set(value) {
        // This setter won't be called directly
      }
    },
    projects() {
      return this.allProjects
    },
    categories() {
      return this.allCategories
    },
    searchedTodos() {
      if (!this.searchText) return this.filteredTodos
      return this.filteredTodos.filter(todo =>
        todo.text.toLowerCase().includes(this.searchText.toLowerCase())
      )
    },
    paginatedTodos() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.searchedTodos.slice(start, end)
    },
    selectAll: {
      get() {
        return this.paginatedTodos.length > 0 &&
               this.paginatedTodos.every(todo => this.selectedTodos.includes(todo.id))
      },
      set(value) {
        if (value) {
          this.selectedTodos = [...this.selectedTodos, ...this.paginatedTodos.map(todo => todo.id)]
          this.selectedTodos = [...new Set(this.selectedTodos)]
        } else {
          this.selectedTodos = this.selectedTodos.filter(id =>
            !this.paginatedTodos.some(todo => todo.id === id)
          )
        }
      }
    },
    dialogTitle() {
      return this.isEditing ? '编辑任务' : '添加任务'
    }
  },
  watch: {
    showAddDialog(val) {
      if (val) {
        this.showDialog = true
        this.isEditing = false
        this.resetCurrentTodo()
      }
    }
  },
  methods: {
    ...mapActions('task', [
      'addTodo',
      'updateTodo',
      'deleteTodo',
      'toggleTodo',
      'clearCompletedTodos',
      'setFilter'
    ]),
    updateFilter() {
      this.setFilter(this.filter)
      this.currentPage = 1
    },
    handleSearch() {
      this.currentPage = 1
    },
    handlePageChange(page) {
      this.currentPage = page
    },
    handleSelectAll(value) {
      this.selectAll = value
    },
    async batchComplete() {
      try {
        for (const todoId of this.selectedTodos) {
          const todo = this.filteredTodos.find(t => t.id === todoId)
          if (todo && !todo.done) {
            await this.toggleTodo(todoId)
          }
        }
        this.selectedTodos = []
        this.$message.success('批量完成成功')
      } catch (error) {
        this.$message.error('批量完成失败')
      }
    },
    async batchDelete() {
      this.$confirm('确定要删除选中的任务吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          for (const todoId of this.selectedTodos) {
            await this.deleteTodo(todoId)
          }
          this.selectedTodos = []
          this.$message.success('批量删除成功')
        } catch (error) {
          this.$message.error('批量删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    async clearCompleted() {
      this.$confirm('确定要清除所有已完成的任务吗？', '确认清除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await this.clearCompletedTodos()
          this.$message.success('清除成功')
        } catch (error) {
          this.$message.error('清除失败')
        }
      }).catch(() => {
        // 用户取消清除
      })
    },
    editTodo(todo) {
      this.isEditing = true
      this.currentTodo = { ...todo }
      this.showDialog = true
    },
    async saveTodo() {
      this.$refs.todoForm.validate(async(valid) => {
        if (valid) {
          try {
            if (this.isEditing) {
              await this.updateTodo({
                id: this.currentTodo.id,
                updates: this.currentTodo
              })
              this.$message.success('保存成功')
            } else {
              await this.addTodo(this.currentTodo)
              this.$message.success('添加成功')
            }
            this.showDialog = false
            this.resetCurrentTodo()
          } catch (error) {
            this.$message.error(this.isEditing ? '保存失败' : '添加失败')
          }
        }
      })
    },
    async deleteTodo(id) {
      this.$confirm('确定要删除这个任务吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await this.deleteTodo(id)
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    resetCurrentTodo() {
      this.currentTodo = {
        text: '',
        priority: 'medium',
        category: 1,
        project: null,
        dueDate: null,
        note: ''
      }
    },
    getPriorityInfo(priority) {
      return this.priorities.find(p => p.value === priority)
    },
    getCategoryInfo(categoryId) {
      return this.categories.find(c => c.id === categoryId)
    },
    getProjectInfo(projectId) {
      return this.projects.find(p => p.id === projectId)
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN')
    },
    isOverdue(dueDate) {
      if (!dueDate) return false
      return new Date(dueDate) < new Date()
    }
  }
}
</script>

<style lang="scss" scoped>
.todo-management {
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

.filter-card {
  .el-select {
    width: 100%;
  }
}

.batch-actions {
  margin-bottom: 16px;
}

.todo-list-card {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;

    .list-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }
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
    margin: 0;
  }
}

.todo-list {
  .todo-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid #EBEEF5;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f8f9fa;
    }

    &:last-child {
      border-bottom: none;
    }

    &.completed {
      opacity: 0.6;
    }

    .todo-checkbox {
      margin-right: 12px;
      margin-top: 2px;
    }

    .todo-status {
      margin-right: 12px;
      margin-top: 2px;
    }

    .todo-content {
      flex: 1;
      cursor: pointer;

      .todo-text {
        font-size: 16px;
        color: #303133;
        margin-bottom: 8px;
        line-height: 1.4;

        &.done {
          text-decoration: line-through;
          color: #909399;
        }
      }

      .todo-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .due-date {
          font-size: 12px;
          color: #909399;

          &.overdue {
            color: #f56c6c;
          }

          i {
            margin-right: 4px;
          }
        }
      }
    }

    .todo-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .todo-actions {
      opacity: 1;
    }
  }
}

@media (max-width: 768px) {
  .todo-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .todo-item {
    .todo-actions {
      opacity: 1;
    }
  }
}
</style>
