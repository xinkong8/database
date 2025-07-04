<template>
  <div class="comparison-analysis">
    <!-- 控制栏 -->
    <div class="analysis-controls">
      <div class="left-controls">
        <el-radio-group v-model="comparisonType" size="small">
          <el-radio-button label="period">期间对比</el-radio-button>
          <el-radio-button label="yearOverYear">同比分析</el-radio-button>
          <el-radio-button label="target">目标对比</el-radio-button>
        </el-radio-group>
      </div>
      <div class="right-controls">
        <el-button v-if="comparisonType === 'target'" size="small" @click="setTarget">
          <i class="el-icon-edit" />
          设置目标
        </el-button>
        <el-button size="small" @click="refreshData">
          <i class="el-icon-refresh" />
          刷新
        </el-button>
      </div>
    </div>

    <!-- 期间对比 -->
    <div v-if="comparisonType === 'period'" class="period-comparison">
      <div class="comparison-summary">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="summary-card current">
              <h4>当前期间</h4>
              <div class="period-info">{{ formatDateRange(dateRange) }}</div>
              <div class="amount-info">
                <div class="income">收入: ￥{{ formatAmount(currentPeriod.income) }}</div>
                <div class="expense">支出: ￥{{ formatAmount(currentPeriod.expense) }}</div>
                <div class="net">净收入: ￥{{ formatAmount(currentPeriod.net) }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="summary-card previous">
              <h4>前一期间</h4>
              <div class="period-info">{{ formatDateRange(previousDateRange) }}</div>
              <div class="amount-info">
                <div class="income">收入: ￥{{ formatAmount(previousPeriod.income) }}</div>
                <div class="expense">支出: ￥{{ formatAmount(previousPeriod.expense) }}</div>
                <div class="net">净收入: ￥{{ formatAmount(previousPeriod.net) }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="summary-card comparison">
              <h4>变化分析</h4>
              <div class="change-info">
                <div class="change-item" :class="periodComparison.incomeChange >= 0 ? 'positive' : 'negative'">
                  <span class="label">收入变化:</span>
                  <span class="value">
                    <i :class="periodComparison.incomeChange >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                    {{ Math.abs(periodComparison.incomeChange).toFixed(1) }}%
                  </span>
                </div>
                <div class="change-item" :class="periodComparison.expenseChange >= 0 ? 'negative' : 'positive'">
                  <span class="label">支出变化:</span>
                  <span class="value">
                    <i :class="periodComparison.expenseChange >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                    {{ Math.abs(periodComparison.expenseChange).toFixed(1) }}%
                  </span>
                </div>
                <div class="change-item" :class="periodComparison.netChange >= 0 ? 'positive' : 'negative'">
                  <span class="label">净收入变化:</span>
                  <span class="value">
                    <i :class="periodComparison.netChange >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                    {{ Math.abs(periodComparison.netChange).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 期间对比图表 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :span="24" :lg="12">
            <div class="chart-container">
              <div class="chart-header">
                <h3>收支对比图</h3>
              </div>
              <div ref="periodChart" class="chart" />
            </div>
          </el-col>
          <el-col :span="24" :lg="12">
            <div class="chart-container">
              <div class="chart-header">
                <h3>分类对比分析</h3>
              </div>
              <div ref="categoryComparisonChart" class="chart" />
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 同比分析 -->
    <div v-if="comparisonType === 'yearOverYear'" class="year-over-year">
      <div class="yoy-summary">
        <h3>同比分析概览</h3>
        <el-alert
          title="同比分析功能开发中"
          type="info"
          description="此功能将提供与去年同期的详细对比分析，包括收支变化趋势、分类对比等"
          show-icon
          :closable="false"
        />
      </div>
    </div>

    <!-- 目标对比 -->
    <div v-if="comparisonType === 'target'" class="target-comparison">
      <div v-if="hasTargets" class="target-summary">
        <h3>目标达成情况</h3>
        <div class="target-cards">
          <div class="target-card income">
            <div class="target-header">
              <h4>收入目标</h4>
              <div class="target-amount">￥{{ formatAmount(targets.income) }}</div>
            </div>
            <div class="progress-section">
              <el-progress
                :percentage="getTargetProgress('income')"
                :color="getProgressColor(getTargetProgress('income'))"
                :stroke-width="12"
              />
              <div class="progress-info">
                <span>实际: ￥{{ formatAmount(currentPeriod.income) }}</span>
                <span>完成率: {{ getTargetProgress('income') }}%</span>
              </div>
            </div>
          </div>

          <div class="target-card expense">
            <div class="target-header">
              <h4>支出目标</h4>
              <div class="target-amount">￥{{ formatAmount(targets.expense) }}</div>
            </div>
            <div class="progress-section">
              <el-progress
                :percentage="getTargetProgress('expense')"
                :color="getExpenseProgressColor(getTargetProgress('expense'))"
                :stroke-width="12"
              />
              <div class="progress-info">
                <span>实际: ￥{{ formatAmount(currentPeriod.expense) }}</span>
                <span>控制率: {{ getTargetProgress('expense') }}%</span>
              </div>
            </div>
          </div>

          <div class="target-card saving">
            <div class="target-header">
              <h4>储蓄目标</h4>
              <div class="target-amount">￥{{ formatAmount(targets.saving) }}</div>
            </div>
            <div class="progress-section">
              <el-progress
                :percentage="getTargetProgress('saving')"
                :color="getProgressColor(getTargetProgress('saving'))"
                :stroke-width="12"
              />
              <div class="progress-info">
                <span>实际: ￥{{ formatAmount(currentPeriod.net) }}</span>
                <span>完成率: {{ getTargetProgress('saving') }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-targets">
        <i class="el-icon-aim" />
        <h3>暂未设置目标</h3>
        <p>设置收入、支出和储蓄目标，跟踪您的财务表现</p>
        <el-button type="primary" @click="setTarget">
          <i class="el-icon-plus" />
          设置目标
        </el-button>
      </div>
    </div>

    <!-- 设置目标对话框 -->
    <el-dialog title="设置财务目标" :visible.sync="targetDialogVisible" width="500px">
      <el-form :model="targetForm" label-width="100px">
        <el-form-item label="收入目标">
          <el-input-number
            v-model="targetForm.income"
            :min="0"
            :step="1000"
            placeholder="设置月收入目标"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="支出目标">
          <el-input-number
            v-model="targetForm.expense"
            :min="0"
            :step="500"
            placeholder="设置月支出目标"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="储蓄目标">
          <el-input-number
            v-model="targetForm.saving"
            :min="0"
            :step="500"
            placeholder="设置月储蓄目标"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="targetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTargets">保存目标</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'ComparisonAnalysis',
  props: {
    dateRange: {
      type: Array,
      default: null
    },
    records: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      comparisonType: 'period',
      targetDialogVisible: false,
      targetForm: {
        income: 0,
        expense: 0,
        saving: 0
      },
      periodChart: null,
      categoryComparisonChart: null
    }
  },
  computed: {
    currentPeriod() {
      const income = this.records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0)
      const expense = this.records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0)

      return {
        income,
        expense,
        net: income - expense
      }
    },
    previousDateRange() {
      if (!this.dateRange || this.dateRange.length !== 2) return null

      const [start, end] = this.dateRange
      const periodLength = end.getTime() - start.getTime()
      const prevStart = new Date(start.getTime() - periodLength)
      const prevEnd = new Date(start.getTime())

      return [prevStart, prevEnd]
    },
    previousPeriod() {
      if (!this.previousDateRange) {
        return { income: 0, expense: 0, net: 0 }
      }

      const [start, end] = this.previousDateRange
      const prevRecords = this.allRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= start && recordDate < end
      })

      const income = prevRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0)
      const expense = prevRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0)

      return {
        income,
        expense,
        net: income - expense
      }
    },
    periodComparison() {
      const incomeChange = this.previousPeriod.income > 0
        ? ((this.currentPeriod.income - this.previousPeriod.income) / this.previousPeriod.income * 100)
        : 0
      const expenseChange = this.previousPeriod.expense > 0
        ? ((this.currentPeriod.expense - this.previousPeriod.expense) / this.previousPeriod.expense * 100)
        : 0
      const netChange = this.previousPeriod.net !== 0
        ? ((this.currentPeriod.net - this.previousPeriod.net) / Math.abs(this.previousPeriod.net) * 100)
        : 0

      return {
        incomeChange,
        expenseChange,
        netChange
      }
    },
    allRecords() {
      try {
        return JSON.parse(localStorage.getItem('financeRecords')) || []
      } catch (e) {
        return []
      }
    },
    targets() {
      try {
        return JSON.parse(localStorage.getItem('financeTargets')) || {}
      } catch (e) {
        return {}
      }
    },
    hasTargets() {
      return this.targets.income > 0 || this.targets.expense > 0 || this.targets.saving > 0
    }
  },
  watch: {
    records: {
      handler() {
        this.$nextTick(() => {
          this.updateCharts()
        })
      },
      immediate: true
    },
    comparisonType() {
      this.$nextTick(() => {
        this.updateCharts()
      })
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.destroyCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initCharts() {
      this.periodChart = echarts.init(this.$refs.periodChart)
      this.categoryComparisonChart = echarts.init(this.$refs.categoryComparisonChart)
      this.updateCharts()
    },
    destroyCharts() {
      if (this.periodChart) this.periodChart.dispose()
      if (this.categoryComparisonChart) this.categoryComparisonChart.dispose()
    },
    handleResize() {
      if (this.periodChart) this.periodChart.resize()
      if (this.categoryComparisonChart) this.categoryComparisonChart.resize()
    },
    updateCharts() {
      if (this.comparisonType === 'period') {
        this.updatePeriodChart()
        this.updateCategoryComparisonChart()
      }
    },
    updatePeriodChart() {
      if (!this.periodChart) return

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['当前期间', '前一期间']
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '40px',
          top: '60px'
        },
        xAxis: {
          type: 'category',
          data: ['收入', '支出', '净收入']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `￥${(value / 1000).toFixed(0)}k`
          }
        },
        series: [
          {
            name: '当前期间',
            type: 'bar',
            data: [
              this.currentPeriod.income,
              this.currentPeriod.expense,
              this.currentPeriod.net
            ],
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '前一期间',
            type: 'bar',
            data: [
              this.previousPeriod.income,
              this.previousPeriod.expense,
              this.previousPeriod.net
            ],
            itemStyle: { color: '#909399' }
          }
        ]
      }

      this.periodChart.setOption(option)
    },
    updateCategoryComparisonChart() {
      if (!this.categoryComparisonChart) return

      // 简化的分类对比图表
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '期间对比',
            type: 'pie',
            radius: '50%',
            data: [
              { value: this.currentPeriod.income, name: '当前收入' },
              { value: this.currentPeriod.expense, name: '当前支出' },
              { value: this.previousPeriod.income, name: '前期收入' },
              { value: this.previousPeriod.expense, name: '前期支出' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      this.categoryComparisonChart.setOption(option)
    },
    formatDateRange(range) {
      if (!range || range.length !== 2) return '未选择'
      const [start, end] = range
      return `${start.toISOString().split('T')[0]} 至 ${end.toISOString().split('T')[0]}`
    },
    setTarget() {
      this.targetForm = { ...this.targets }
      this.targetDialogVisible = true
    },
    saveTargets() {
      localStorage.setItem('financeTargets', JSON.stringify(this.targetForm))
      this.targetDialogVisible = false
      this.$message.success('目标设置成功')
    },
    getTargetProgress(type) {
      let actual = 0
      const target = this.targets[type] || 0

      if (type === 'income') {
        actual = this.currentPeriod.income
      } else if (type === 'expense') {
        actual = this.currentPeriod.expense
      } else if (type === 'saving') {
        actual = this.currentPeriod.net
      }

      return target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
    },
    getProgressColor(percentage) {
      if (percentage >= 80) return '#67C23A'
      if (percentage >= 60) return '#E6A23C'
      return '#F56C6C'
    },
    getExpenseProgressColor(percentage) {
      // 支出目标的颜色逻辑相反，支出越少越好
      if (percentage <= 80) return '#67C23A'
      if (percentage <= 100) return '#E6A23C'
      return '#F56C6C'
    },
    formatAmount(amount) {
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    refreshData() {
      this.$emit('refresh')
      this.$nextTick(() => {
        this.updateCharts()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.comparison-analysis {
  .analysis-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .left-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .right-controls {
      display: flex;
      gap: 8px;
    }
  }

  .period-comparison {
    .comparison-summary {
      margin-bottom: 24px;

      .summary-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        height: 180px;

        h4 {
          margin: 0 0 12px 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }

        .period-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 16px;
          padding: 4px 8px;
          background: #f0f2f5;
          border-radius: 4px;
        }

        .amount-info {
          .income, .expense, .net {
            margin-bottom: 8px;
            font-size: 14px;
          }

          .income { color: #67C23A; }
          .expense { color: #F56C6C; }
          .net { color: #409EFF; }
        }

        .change-info {
          .change-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;

            .label {
              font-weight: 500;
            }

            .value {
              display: flex;
              align-items: center;
              gap: 4px;
              font-weight: 600;
            }

            &.positive .value {
              color: #67C23A;
            }

            &.negative .value {
              color: #F56C6C;
            }
          }
        }
      }
    }
  }

  .charts-section {
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .chart-header {
        margin-bottom: 20px;

        h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .chart {
        width: 100%;
        height: 300px;
      }
    }
  }

  .year-over-year {
    .yoy-summary {
      background: white;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      h3 {
        margin: 0 0 20px 0;
        color: #2c3e50;
      }
    }
  }

  .target-comparison {
    .target-summary {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      h3 {
        margin: 0 0 24px 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
      }

      .target-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;

        .target-card {
          border: 2px solid #f0f2f5;
          border-radius: 12px;
          padding: 20px;
          transition: border-color 0.3s ease;

          &:hover {
            border-color: #409EFF;
          }

          &.income {
            background: linear-gradient(135deg, rgba(103, 194, 58, 0.05) 0%, rgba(103, 194, 58, 0.02) 100%);
          }

          &.expense {
            background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, rgba(245, 108, 108, 0.02) 100%);
          }

          &.saving {
            background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(64, 158, 255, 0.02) 100%);
          }

          .target-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            h4 {
              margin: 0;
              color: #2c3e50;
              font-size: 16px;
            }

            .target-amount {
              font-size: 18px;
              font-weight: 600;
              color: #409EFF;
            }
          }

          .progress-section {
            .progress-info {
              display: flex;
              justify-content: space-between;
              margin-top: 8px;
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }

    .no-targets {
      background: white;
      border-radius: 12px;
      padding: 60px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      i {
        font-size: 48px;
        color: #409EFF;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 12px 0;
        color: #2c3e50;
        font-size: 20px;
      }

      p {
        margin: 0 0 24px 0;
        color: #666;
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .comparison-analysis {
    .analysis-controls {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .left-controls {
        justify-content: center;
      }
    }

    .period-comparison .comparison-summary .summary-card {
      height: auto;
      margin-bottom: 16px;
    }

    .target-comparison .target-summary .target-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>
