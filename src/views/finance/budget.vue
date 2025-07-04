<template>
  <div class="finance-budget">
    <div class="page-header">
      <h2>预算管理</h2>
      <p>制定和管理您的月度预算计划</p>
      <div class="header-actions">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          format="yyyy年MM月"
          value-format="yyyy-MM"
          @change="handleMonthChange"
        />
        <el-button type="primary" @click="openBudgetDialog">
          <i class="el-icon-plus" />
          设置预算
        </el-button>
      </div>
    </div>

    <!-- 预算概览 -->
    <div class="budget-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon income">
              <i class="el-icon-arrow-up" />
            </div>
            <div class="card-content">
              <h3>预算收入</h3>
              <p class="amount">¥{{ formatAmount(budgetSummary.totalIncome) }}</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon expense">
              <i class="el-icon-arrow-down" />
            </div>
            <div class="card-content">
              <h3>预算支出</h3>
              <p class="amount">¥{{ formatAmount(budgetSummary.totalExpense) }}</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon actual">
              <i class="el-icon-wallet" />
            </div>
            <div class="card-content">
              <h3>实际支出</h3>
              <p class="amount">¥{{ formatAmount(budgetSummary.actualExpense) }}</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon" :class="budgetSummary.remaining >= 0 ? 'success' : 'danger'">
              <i :class="budgetSummary.remaining >= 0 ? 'el-icon-check' : 'el-icon-warning'" />
            </div>
            <div class="card-content">
              <h3>预算结余</h3>
              <p class="amount" :class="budgetSummary.remaining >= 0 ? 'success' : 'danger'">
                ¥{{ formatAmount(budgetSummary.remaining) }}
              </p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-tabs v-model="activeTab" class="budget-tabs">
      <el-tab-pane label="预算管理" name="management">
        <div class="management-content">
          <!-- 预算执行情况 -->
          <div class="budget-progress">
            <div class="section-header">
              <h3>预算执行情况</h3>
              <div class="header-actions">
                <el-button size="small" @click="refreshData">
                  <i class="el-icon-refresh" />
                  刷新
                </el-button>
                <el-button size="small" @click="copyLastMonthBudget">
                  <i class="el-icon-document-copy" />
                  复制上月预算
                </el-button>
              </div>
            </div>
            <div class="progress-list">
              <div v-for="item in budgetItems" :key="item.category" class="progress-item">
                <div class="progress-header">
                  <span class="category">{{ item.category }}</span>
                  <span class="amount">
                    ¥{{ formatAmount(item.actual) }} / ¥{{ formatAmount(item.budget) }}
                  </span>
                  <el-button size="mini" type="text" @click="editBudget(item)">
                    <i class="el-icon-edit" />
                  </el-button>
                </div>
                <div class="progress-bar">
                  <el-progress
                    :percentage="item.percentage"
                    :status="item.status"
                    :stroke-width="20"
                    :show-text="false"
                  />
                </div>
                <div class="progress-footer">
                  <span class="percentage">{{ item.percentage }}%</span>
                  <span class="remaining" :class="item.remaining >= 0 ? 'success' : 'danger'">
                    {{ item.remaining >= 0 ? '剩余' : '超支' }}
                    ¥{{ formatAmount(Math.abs(item.remaining)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 预算分析图表 -->
          <el-row :gutter="20" class="chart-section">
            <el-col :span="12">
              <div class="chart-container">
                <h3>预算 vs 实际对比</h3>
                <div ref="budgetChart" class="chart" />
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-container">
                <h3>预算执行趋势</h3>
                <div ref="trendChart" class="chart" />
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="预算分析" name="analysis">
        <BudgetAnalysis
          :budgets="budgets"
          :records="records"
          :month="selectedMonth"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑预算对话框 -->
    <EditBudgetDialog
      :visible.sync="budgetDialogVisible"
      :budget="currentBudget"
      :categories="expenseCategories"
      @save="handleBudgetSave"
      @delete="handleBudgetDelete"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import BudgetAnalysis from './components/BudgetAnalysis'
import EditBudgetDialog from './components/EditBudgetDialog'

export default {
  name: 'FinanceBudget',
  components: {
    BudgetAnalysis,
    EditBudgetDialog
  },
  data() {
    return {
      selectedMonth: new Date().toISOString().slice(0, 7),
      activeTab: 'management',
      budgetDialogVisible: false,
      currentBudget: null,
      expenseCategories: [
        '餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '通讯', '旅游', '其他'
      ],
      budgets: [],
      records: []
    }
  },
  computed: {
    budgetSummary() {
      const currentBudgets = this.budgets.filter(b => b.month === this.selectedMonth)
      const currentRecords = this.records.filter(r => r.date.startsWith(this.selectedMonth))

      const totalIncome = currentRecords
        .filter(r => r.recordType === 'income')
        .reduce((sum, r) => sum + Number(r.amount), 0)

      const totalExpense = currentBudgets.reduce((sum, b) => sum + Number(b.amount), 0)

      const actualExpense = currentRecords
        .filter(r => r.recordType === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0)

      return {
        totalIncome,
        totalExpense,
        actualExpense,
        remaining: totalExpense - actualExpense
      }
    },
    budgetItems() {
      const currentBudgets = this.budgets.filter(b => b.month === this.selectedMonth)
      const currentRecords = this.records.filter(r => r.date.startsWith(this.selectedMonth))

      return currentBudgets.map(budget => {
        const actual = currentRecords
          .filter(r => r.recordType === 'expense' && r.category === budget.category)
          .reduce((sum, r) => sum + Number(r.amount), 0)

        const budgetAmount = Number(budget.amount)
        const percentage = Math.min(Math.round((actual / budgetAmount) * 100), 100)
        const remaining = budgetAmount - actual

        let status = 'normal'
        if (percentage >= 100) status = 'exception'
        else if (percentage >= 80) status = 'warning'
        else if (percentage >= 60) status = 'normal'
        else status = 'success'

        return {
          category: budget.category,
          budget: budgetAmount,
          actual,
          percentage,
          remaining,
          status
        }
      })
    }
  },
  mounted() {
    this.loadData()
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  methods: {
    loadData() {
      // 从localStorage加载数据
      const budgets = localStorage.getItem('budgets')
      if (budgets) {
        this.budgets = JSON.parse(budgets)
      }

      const records = localStorage.getItem('financeRecords')
      if (records) {
        this.records = JSON.parse(records)
      }
    },

    saveData() {
      localStorage.setItem('budgets', JSON.stringify(this.budgets))
    },

    handleMonthChange() {
      this.$nextTick(() => {
        this.updateCharts()
      })
    },

    openBudgetDialog() {
      this.currentBudget = {
        month: this.selectedMonth,
        category: '',
        amount: 0,
        note: ''
      }
      this.budgetDialogVisible = true
    },

    editBudget(item) {
      const budget = this.budgets.find(
        b => b.month === this.selectedMonth && b.category === item.category
      )
      this.currentBudget = { ...budget }
      this.budgetDialogVisible = true
    },

    handleBudgetSave(budgetData) {
      const existingIndex = this.budgets.findIndex(
        b => b.month === budgetData.month && b.category === budgetData.category
      )

      if (existingIndex !== -1) {
        this.budgets[existingIndex] = { ...budgetData }
        this.$message.success('预算更新成功')
      } else {
        this.budgets.push({ ...budgetData })
        this.$message.success('预算设置成功')
      }

      this.saveData()
      this.budgetDialogVisible = false
      this.$nextTick(() => {
        this.updateCharts()
      })
    },

    handleBudgetDelete(budgetData) {
      const index = this.budgets.findIndex(
        b => b.month === budgetData.month && b.category === budgetData.category
      )

      if (index !== -1) {
        this.budgets.splice(index, 1)
        this.saveData()
        this.$message.success('预算删除成功')
        this.$nextTick(() => {
          this.updateCharts()
        })
      }
    },

    copyLastMonthBudget() {
      const lastMonth = new Date(this.selectedMonth + '-01')
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const lastMonthStr = lastMonth.toISOString().slice(0, 7)

      const lastMonthBudgets = this.budgets.filter(b => b.month === lastMonthStr)

      if (lastMonthBudgets.length === 0) {
        this.$message.warning('上月没有预算数据')
        return
      }

      // 检查当前月份是否已有预算
      const currentMonthBudgets = this.budgets.filter(b => b.month === this.selectedMonth)

      if (currentMonthBudgets.length > 0) {
        this.$confirm('当前月份已有预算数据，是否覆盖？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doCopyLastMonthBudget(lastMonthBudgets)
        })
      } else {
        this.doCopyLastMonthBudget(lastMonthBudgets)
      }
    },

    doCopyLastMonthBudget(lastMonthBudgets) {
      // 删除当前月份的预算
      this.budgets = this.budgets.filter(b => b.month !== this.selectedMonth)

      // 复制上月预算到当前月份
      const newBudgets = lastMonthBudgets.map(budget => ({
        ...budget,
        month: this.selectedMonth
      }))

      this.budgets.push(...newBudgets)
      this.saveData()
      this.$message.success(`已复制上月预算，共 ${newBudgets.length} 个分类`)

      this.$nextTick(() => {
        this.updateCharts()
      })
    },

    refreshData() {
      this.loadData()
      this.$nextTick(() => {
        this.updateCharts()
      })
      this.$message.success('数据已刷新')
    },

    formatAmount(amount) {
      return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    },

    initCharts() {
      this.initBudgetChart()
      this.initTrendChart()
    },

    initBudgetChart() {
      const chart = echarts.init(this.$refs.budgetChart)

      const data = this.budgetItems.map(item => ({
        name: item.category,
        budget: item.budget,
        actual: item.actual
      }))

      const categories = data.map(d => d.name)
      const budgetData = data.map(d => d.budget)
      const actualData = data.map(d => d.actual)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['预算', '实际']
        },
        xAxis: {
          type: 'category',
          data: categories
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '预算',
            type: 'bar',
            data: budgetData,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '实际',
            type: 'bar',
            data: actualData,
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      }

      chart.setOption(option)
      this.budgetChart = chart
    },

    initTrendChart() {
      const chart = echarts.init(this.$refs.trendChart)

      // 生成近6个月的数据
      const months = []
      const budgetTrend = []
      const actualTrend = []

      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStr = date.toISOString().slice(0, 7)
        months.push(date.getMonth() + 1 + '月')

        const monthBudgets = this.budgets.filter(b => b.month === monthStr)
        const monthRecords = this.records.filter(r => r.date.startsWith(monthStr))

        const budgetTotal = monthBudgets.reduce((sum, b) => sum + Number(b.amount), 0)
        const actualTotal = monthRecords
          .filter(r => r.recordType === 'expense')
          .reduce((sum, r) => sum + Number(r.amount), 0)

        budgetTrend.push(budgetTotal)
        actualTrend.push(actualTotal)
      }

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['预算支出', '实际支出']
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '预算支出',
            type: 'line',
            data: budgetTrend,
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '实际支出',
            type: 'line',
            data: actualTrend,
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      }

      chart.setOption(option)
      this.trendChart = chart
    },

    updateCharts() {
      if (this.budgetChart) {
        this.initBudgetChart()
      }
      if (this.trendChart) {
        this.initTrendChart()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.finance-budget {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;

    h2 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 28px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #8c92a4;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .budget-overview {
    margin-bottom: 32px;

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 16px;

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;

        &.income {
          background: linear-gradient(135deg, #67C23A, #85ce61);
          color: white;
        }

        &.expense {
          background: linear-gradient(135deg, #F56C6C, #f78989);
          color: white;
        }

        &.actual {
          background: linear-gradient(135deg, #409EFF, #66b1ff);
          color: white;
        }

        &.success {
          background: linear-gradient(135deg, #67C23A, #85ce61);
          color: white;
        }

        &.danger {
          background: linear-gradient(135deg, #F56C6C, #f78989);
          color: white;
        }
      }

      .card-content {
        flex: 1;

        h3 {
          margin: 0 0 8px 0;
          color: #8c92a4;
          font-size: 14px;
          font-weight: 500;
        }

        .amount {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;

          &.success {
            color: #67C23A;
          }

          &.danger {
            color: #F56C6C;
          }
        }
      }
    }
  }

  .budget-tabs {
    margin-bottom: 24px;

    ::v-deep .el-tabs__header {
      margin-bottom: 20px;
    }
  }

  .management-content {
    // 预算管理内容样式
  }

  .budget-progress {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .progress-list {
      .progress-item {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .category {
            font-weight: 500;
            color: #2c3e50;
            flex: 1;
          }

          .amount {
            color: #8c92a4;
            font-size: 14px;
            margin-right: 12px;
          }

          .el-button {
            padding: 4px 8px;

            &:hover {
              color: #409EFF;
            }
          }
        }

        .progress-bar {
          margin-bottom: 8px;
        }

        .progress-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;

          .percentage {
            color: #8c92a4;
          }

          .remaining {
            &.success {
              color: #67C23A;
            }

            &.danger {
              color: #F56C6C;
            }
          }
        }
      }
    }
  }

  .chart-section {
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

      h3 {
        margin: 0 0 20px 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
      }

      .chart {
        height: 300px;
      }
    }
  }
}
</style>
