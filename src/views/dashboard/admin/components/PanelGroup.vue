<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('finance')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月结余
          </div>
          <count-to :start-val="0" :end-val="monthBalance" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('todos')">
        <div class="card-panel-icon-wrapper icon-todo">
          <svg-icon icon-class="list" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            待办事项
          </div>
          <count-to :start-val="0" :end-val="todoCount" :duration="3000" class="card-panel-num" />
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('goals')">
        <div class="card-panel-icon-wrapper icon-goal">
          <svg-icon icon-class="star" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            已完成目标
          </div>
          <count-to :start-val="0" :end-val="completedGoals" :duration="3200" class="card-panel-num" />
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('health')">
        <div class="card-panel-icon-wrapper icon-health">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            健康指数
          </div>
          <count-to :start-val="0" :end-val="healthScore" :duration="3600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      monthBalance: 0,
      todoCount: 0,
      completedGoals: 0,
      healthScore: 85
    }
  },
  created() {
    this.loadLifeData()
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },

    loadLifeData() {
      // 加载本月财务数据
      this.loadFinanceData()
      // 加载待办事项数据
      this.loadTodoData()
      // 加载目标数据
      this.loadGoalData()
    },

    loadFinanceData() {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const incomeList = JSON.parse(localStorage.getItem('incomeList') || '[]')
      const expenseList = JSON.parse(localStorage.getItem('expenseList') || '[]')

      const monthIncome = incomeList
        .filter(item => item.date && item.date.startsWith(currentMonth))
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

      const monthExpense = expenseList
        .filter(item => item.date && item.date.startsWith(currentMonth))
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

      this.monthBalance = monthIncome - monthExpense
    },

    loadTodoData() {
      const todos = JSON.parse(localStorage.getItem('todos') || '[]')
      this.todoCount = todos.filter(todo => !todo.done).length
    },

    loadGoalData() {
      const goals = JSON.parse(localStorage.getItem('goals') || '[]')
      this.completedGoals = goals.filter(goal => goal.completed).length
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    border-radius: 8px;

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-money {
        background: #67C23A;
      }

      .icon-todo {
        background: #409EFF;
      }

      .icon-goal {
        background: #E6A23C;
      }

      .icon-health {
        background: #F56C6C;
      }
    }

    .icon-money {
      color: #67C23A;
    }

    .icon-todo {
      color: #409EFF;
    }

    .icon-goal {
      color: #E6A23C;
    }

    .icon-health {
      color: #F56C6C;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
