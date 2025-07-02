<template>
  <el-card class="box-card-component" style="margin-left:8px;">
    <div slot="header" class="box-card-header">
      <h3>快速操作</h3>
    </div>
    <div class="quick-actions">
      <div class="action-item" @click="addIncome">
        <div class="action-icon income">
          <svg-icon icon-class="money" />
        </div>
        <span>记录收入</span>
      </div>

      <div class="action-item" @click="addExpense">
        <div class="action-icon expense">
          <svg-icon icon-class="shopping" />
        </div>
        <span>记录支出</span>
      </div>

      <div class="action-item" @click="addTodo">
        <div class="action-icon todo">
          <svg-icon icon-class="list" />
        </div>
        <span>添加待办</span>
      </div>

      <div class="action-item" @click="addGoal">
        <div class="action-icon goal">
          <svg-icon icon-class="star" />
        </div>
        <span>设定目标</span>
      </div>

      <div class="action-item" @click="viewFinance">
        <div class="action-icon finance">
          <svg-icon icon-class="chart" />
        </div>
        <span>财务总览</span>
      </div>

      <div class="action-item" @click="viewSettings">
        <div class="action-icon settings">
          <svg-icon icon-class="theme" />
        </div>
        <span>个人设置</span>
      </div>
    </div>

    <div class="user-info">
      <div class="user-avatar">
        <pan-thumb :image="avatar" class="panThumb" />
      </div>
      <div class="user-details">
        <h4>{{ name || '用户' }}</h4>
        <p class="user-motto">让生活更有条理</p>
      </div>
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'

export default {
  components: { PanThumb },
  computed: {
    ...mapGetters([
      'name',
      'avatar'
    ])
  },
  methods: {
    addIncome() {
      this.$router.push('/finance/income')
    },

    addExpense() {
      this.$router.push('/finance/expense')
    },

    addTodo() {
      // 简单的添加待办事项逻辑
      this.$prompt('请输入待办事项', '添加待办', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value) {
          const todos = JSON.parse(localStorage.getItem('todos') || '[]')
          todos.push({
            text: value,
            done: false,
            id: Date.now()
          })
          localStorage.setItem('todos', JSON.stringify(todos))
          this.$message.success('待办事项添加成功')
          this.$emit('refresh-data')
        }
      }).catch(() => {})
    },

    addGoal() {
      this.$prompt('请输入目标', '设定目标', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value) {
          const goals = JSON.parse(localStorage.getItem('goals') || '[]')
          goals.push({
            title: value,
            completed: false,
            id: Date.now(),
            createdAt: new Date().toISOString()
          })
          localStorage.setItem('goals', JSON.stringify(goals))
          this.$message.success('目标设定成功')
          this.$emit('refresh-data')
        }
      }).catch(() => {})
    },

    viewFinance() {
      this.$router.push('/finance')
    },

    viewSettings() {
      this.$router.push('/profile')
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card-component {
  .box-card-header {
    padding: 16px 0;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin: -20px -20px 20px -20px;
    border-radius: 4px 4px 0 0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 8px;
      border-radius: 8px;
      background: #f8f9fa;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .action-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        font-size: 20px;
        color: white;

        &.income {
          background: #67C23A;
        }

        &.expense {
          background: #F56C6C;
        }

        &.todo {
          background: #409EFF;
        }

        &.goal {
          background: #E6A23C;
        }

        &.finance {
          background: #909399;
        }

        &.settings {
          background: #606266;
        }
      }

      span {
        font-size: 12px;
        color: #606266;
        text-align: center;
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .user-avatar {
      margin-right: 12px;

      .panThumb {
        width: 50px !important;
        height: 50px !important;
        border-radius: 50%;
      }
    }

    .user-details {
      flex: 1;

      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: #303133;
      }

      .user-motto {
        margin: 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: repeat(3, 1fr) !important;

    .action-item {
      padding: 12px 4px !important;

      .action-icon {
        width: 32px !important;
        height: 32px !important;
        font-size: 16px !important;
      }

      span {
        font-size: 10px !important;
      }
    }
  }
}
</style>
