<template>
  <div class="budget-analysis">
    <!-- 分析概览 -->
    <div class="analysis-overview">
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="analysis-card">
            <div class="card-header">
              <h4>预算达成率</h4>
              <span class="rate" :class="achievementRate >= 80 ? 'success' : achievementRate >= 60 ? 'warning' : 'danger'">
                {{ achievementRate }}%
              </span>
            </div>
            <div class="progress-wrapper">
              <el-progress
                :percentage="achievementRate"
                :status="achievementRate >= 80 ? 'success' : achievementRate >= 60 ? 'warning' : 'exception'"
                :stroke-width="12"
              />
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="analysis-card">
            <div class="card-header">
              <h4>预算执行天数</h4>
              <span class="days">{{ executionDays }}天</span>
            </div>
            <div class="days-info">
              <span>本月剩余 {{ remainingDays }} 天</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="analysis-card">
            <div class="card-header">
              <h4>超支警告</h4>
              <span class="alert-count" :class="alertCount > 0 ? 'danger' : 'success'">
                {{ alertCount }}个分类
              </span>
            </div>
            <div class="alert-info">
              <span>{{ alertCount > 0 ? '需要关注' : '执行良好' }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 预算健康度雷达图 -->
    <div class="budget-radar">
      <h3>预算健康度分析</h3>
      <div ref="radarChart" class="chart" />
    </div>

    <!-- 分类详细分析 -->
    <div class="category-analysis">
      <h3>分类详细分析</h3>
      <el-table :data="categoryAnalysis" style="width: 100%" stripe>
        <el-table-column prop="category" label="分类" width="120">
          <template slot-scope="scope">
            <el-tag :type="getCategoryTagType(scope.row.status)">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="budget" label="预算金额" width="120">
          <template slot-scope="scope">
            ¥{{ formatAmount(scope.row.budget) }}
          </template>
        </el-table-column>
        <el-table-column prop="actual" label="实际支出" width="120">
          <template slot-scope="scope">
            ¥{{ formatAmount(scope.row.actual) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="执行率" width="120">
          <template slot-scope="scope">
            <span :class="getPercentageClass(scope.row.percentage)">
              {{ scope.row.percentage }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="variance" label="差异" width="120">
          <template slot-scope="scope">
            <span :class="scope.row.variance >= 0 ? 'success' : 'danger'">
              {{ scope.row.variance >= 0 ? '+' : '' }}¥{{ formatAmount(scope.row.variance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="dailyAverage" label="日均支出" width="120">
          <template slot-scope="scope">
            ¥{{ formatAmount(scope.row.dailyAverage) }}
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="趋势预测" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTrendTagType(scope.row.trend)">
              {{ getTrendText(scope.row.trend) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="建议" min-width="200">
          <template slot-scope="scope">
            <span class="suggestion">{{ scope.row.suggestion }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 预算建议 -->
    <div v-if="suggestions.length > 0" class="budget-suggestions">
      <h3>预算优化建议</h3>
      <div class="suggestions-list">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          :class="suggestion.type"
        >
          <div class="suggestion-icon">
            <i :class="suggestion.icon" />
          </div>
          <div class="suggestion-content">
            <h4>{{ suggestion.title }}</h4>
            <p>{{ suggestion.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'BudgetAnalysis',
  props: {
    budgets: {
      type: Array,
      default: () => []
    },
    records: {
      type: Array,
      default: () => []
    },
    month: {
      type: String,
      default: ''
    }
  },
  computed: {
    currentBudgets() {
      return this.budgets.filter(b => b.month === this.month)
    },
    currentRecords() {
      return this.records.filter(r => r.date.startsWith(this.month))
    },
    achievementRate() {
      if (this.currentBudgets.length === 0) return 0

      const totalBudget = this.currentBudgets.reduce((sum, b) => sum + Number(b.amount), 0)
      if (totalBudget === 0) return 0

      const totalActual = this.currentRecords
        .filter(r => r.recordType === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0)

      // 限制在 0-100 之间并四舍五入
      return Math.min(100, Math.max(0, Math.round((totalActual / totalBudget) * 100)))
    },
    executionDays() {
      const now = new Date()
      const monthStart = new Date(this.month + '-01')
      return Math.max(1, Math.ceil((now - monthStart) / (1000 * 60 * 60 * 24)))
    },
    remainingDays() {
      const now = new Date()
      const monthEnd = new Date(this.month + '-01')
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      return Math.max(0, Math.ceil((monthEnd - now) / (1000 * 60 * 60 * 24)))
    },
    alertCount() {
      return this.categoryAnalysis.filter(item =>
        item.status === 'danger' || item.percentage >= 90
      ).length
    },
    categoryAnalysis() {
      return this.currentBudgets.map(budget => {
        const categoryRecords = this.currentRecords.filter(
          r => r.recordType === 'expense' && r.category === budget.category
        )
        const actual = categoryRecords.reduce((sum, r) => sum + Number(r.amount), 0)
        const budgetAmount = Number(budget.amount)
        const percentage = budgetAmount === 0
          ? 0
          : Math.min(100, Math.max(0, Math.round((actual / budgetAmount) * 100)))
        const variance = budgetAmount - actual
        const dailyAverage = actual / this.executionDays

        // 日均支出推算趋势预测（>110% danger，>90% warning，其余 success）
        const projectedTotal = dailyAverage * this.getDaysInMonth()
        let trend = 'success'
        if (projectedTotal > budgetAmount * 1.1) {
          trend = 'danger'
        } else if (projectedTotal > budgetAmount * 0.9) {
          trend = 'warning'
        }

        // 状态判断
        let status = 'normal'
        if (percentage >= 100) status = 'danger'
        else if (percentage >= 80) status = 'warning'
        else status = 'success'

        // 建议生成
        let suggestion = ''
        if (percentage >= 100) {
          suggestion = '已超支，建议控制该分类支出'
        } else if (percentage >= 80) {
          suggestion = '接近预算上限，请注意控制支出'
        } else if (percentage <= 30) {
          suggestion = '支出较少，可适当增加或调整预算'
        } else {
          suggestion = '执行良好，保持当前支出水平'
        }

        return {
          category: budget.category,
          budget: budgetAmount,
          actual,
          percentage,
          variance,
          dailyAverage,
          trend,
          status,
          suggestion
        }
      })
    },
    suggestions() {
      const suggestions = []

      // 超支提醒
      const overBudgetCategories = this.categoryAnalysis.filter(item => item.percentage >= 100)
      if (overBudgetCategories.length > 0) {
        suggestions.push({
          type: 'danger',
          icon: 'el-icon-warning',
          title: '预算超支警告',
          content: `${overBudgetCategories.map(c => c.category).join('、')} 分类已超出预算，建议立即控制支出。`
        })
      }

      // 节省提醒
      const underBudgetCategories = this.categoryAnalysis.filter(item => item.percentage <= 30)
      if (underBudgetCategories.length > 0) {
        suggestions.push({
          type: 'success',
          icon: 'el-icon-success',
          title: '预算节省良好',
          content: `${underBudgetCategories.map(c => c.category).join('、')} 分类支出较少，表现优秀。`
        })
      }

      // 趋势预警
      const dangerTrendCategories = this.categoryAnalysis.filter(item => item.trend === 'danger')
      if (dangerTrendCategories.length > 0) {
        suggestions.push({
          type: 'warning',
          icon: 'el-icon-info',
          title: '支出趋势预警',
          content: `根据当前支出趋势，${dangerTrendCategories.map(c => c.category).join('、')} 分类可能在月底超支。`
        })
      }

      return suggestions
    }
  },
  watch: {
    month() {
      this.$nextTick(() => {
        this.updateRadarChart()
      })
    },
    categoryAnalysis: {
      deep: true,
      handler(newVal) {
        if (newVal && newVal.length) {
          this.$nextTick(() => {
            this.updateRadarChart()
          })
        }
      }
    }
  },
  mounted() {
    // 初次挂载根据已有数据决定是否绘制
    this.$nextTick(() => {
      this.updateRadarChart()
    })
  },
  methods: {
    formatAmount(amount) {
      return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    },

    getDaysInMonth() {
      const date = new Date(this.month + '-01')
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    },

    getCategoryTagType(status) {
      const typeMap = {
        success: 'success',
        warning: 'warning',
        danger: 'danger',
        normal: 'info'
      }
      return typeMap[status] || 'info'
    },

    getPercentageClass(percentage) {
      if (percentage >= 100) return 'danger'
      if (percentage >= 80) return 'warning'
      return 'success'
    },

    getTrendTagType(trend) {
      const typeMap = {
        success: 'success',
        warning: 'warning',
        danger: 'danger'
      }
      return typeMap[trend] || 'info'
    },

    getTrendText(trend) {
      const textMap = {
        success: '良好',
        warning: '注意',
        danger: '超支风险'
      }
      return textMap[trend] || '正常'
    },

    initRadarChart() {
      // 如果已有实例，先销毁避免重复初始化错误
      if (this.radarChart) {
        this.radarChart.dispose()
      }
      const chart = echarts.init(this.$refs.radarChart)

      const categories = this.categoryAnalysis.map(item => item.category)
      const budgetData = this.categoryAnalysis.map(item => item.percentage)

      const indicator = categories.map(category => ({
        name: category,
        max: 100
      }))

      const option = {
        radar: {
          indicator,
          radius: '60%'
        },
        series: [{
          name: '预算执行率',
          type: 'radar',
          data: [{
            value: budgetData,
            name: '当前执行情况',
            itemStyle: {
              color: '#409EFF'
            },
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            }
          }]
        }]
      }

      chart.setOption(option)
      this.radarChart = chart
    },

    updateRadarChart() {
      if (!this.radarChart) {
        if (this.categoryAnalysis.length) {
          this.initRadarChart()
        }
        return
      }

      this.initRadarChart()
    }
  }
}
</script>

<style lang="scss" scoped>
.budget-analysis {
  .analysis-overview {
    margin-bottom: 32px;

    .analysis-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 500;
        }

        .rate, .days, .alert-count {
          font-size: 24px;
          font-weight: 600;

          &.success {
            color: #67C23A;
          }

          &.warning {
            color: #E6A23C;
          }

          &.danger {
            color: #F56C6C;
          }
        }
      }

      .progress-wrapper {
        margin-bottom: 8px;
      }

      .days-info, .alert-info {
        color: #8c92a4;
        font-size: 14px;
      }
    }
  }

  .budget-radar {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
    }

    .chart {
      height: 400px;
    }
  }

  .category-analysis {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
    }

    .success {
      color: #67C23A;
    }

    .warning {
      color: #E6A23C;
    }

    .danger {
      color: #F56C6C;
    }

    .suggestion {
      color: #8c92a4;
      font-size: 13px;
    }
  }

  .budget-suggestions {
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

    .suggestions-list {
      .suggestion-item {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        &.success {
          background: #f0f9ff;
          border-left: 4px solid #67C23A;
        }

        &.warning {
          background: #fdf6ec;
          border-left: 4px solid #E6A23C;
        }

        &.danger {
          background: #fef0f0;
          border-left: 4px solid #F56C6C;
        }

        .suggestion-icon {
          margin-right: 12px;
          font-size: 20px;

          i {
            color: inherit;
          }
        }

        .suggestion-content {
          flex: 1;

          h4 {
            margin: 0 0 8px 0;
            color: #2c3e50;
            font-size: 16px;
            font-weight: 500;
          }

          p {
            margin: 0;
            color: #8c92a4;
            font-size: 14px;
            line-height: 1.5;
          }
        }
      }
    }
  }
}
</style>
