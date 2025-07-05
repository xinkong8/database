<template>
  <div class="finance-statistics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>统计分析</h2>
          <p>深入分析您的财务数据和消费习惯</p>
        </div>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="monthrange"
            size="medium"
            placeholder="选择月份范围"
            :picker-options="pickerOptions"
            @change="handleDateRangeChange"
          />
          <el-dropdown @command="handleExport">
            <el-button type="primary">
              <i class="el-icon-download" />
              导出数据
              <i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="json">导出JSON</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button v-if="isEmpty" @click="generateTestData">
            <i class="el-icon-magic-stick" />
            生成测试数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据为空时的提示 -->
    <div v-if="isEmpty" class="empty-state">
      <i class="el-icon-data-line" />
      <h3>暂无统计数据</h3>
      <p>您还没有任何财务记录，无法进行统计分析</p>
      <el-button type="primary" @click="generateTestData">
        <i class="el-icon-magic-stick" />
        生成测试数据体验功能
      </el-button>
    </div>

    <!-- 统计内容 -->
    <div v-else class="statistics-content">
      <!-- 概览仪表盘 -->
      <div class="overview-dashboard">
        <div class="overview-grid">
          <div class="overview-card income">
            <div class="card-icon">
              <i class="el-icon-arrow-up" />
            </div>
            <div class="card-content">
              <div class="amount">￥{{ formatAmount(overview.totalIncome) }}</div>
              <div class="label">总收入</div>
              <div class="change" :class="overview.incomeChange >= 0 ? 'positive' : 'negative'">
                <i :class="overview.incomeChange >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                {{ Math.abs(overview.incomeChange).toFixed(1) }}%
              </div>
            </div>
          </div>

          <div class="overview-card expense">
            <div class="card-icon">
              <i class="el-icon-arrow-down" />
            </div>
            <div class="card-content">
              <div class="amount">￥{{ formatAmount(overview.totalExpense) }}</div>
              <div class="label">总支出</div>
              <div class="change" :class="overview.expenseChange >= 0 ? 'negative' : 'positive'">
                <i :class="overview.expenseChange >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
                {{ Math.abs(overview.expenseChange).toFixed(1) }}%
              </div>
            </div>
          </div>

          <div class="overview-card net">
            <div class="card-icon">
              <i class="el-icon-wallet" />
            </div>
            <div class="card-content">
              <div class="amount">￥{{ formatAmount(overview.netIncome) }}</div>
              <div class="label">净收入</div>
              <div class="sub-label">储蓄率 {{ overview.savingRate }}%</div>
            </div>
          </div>

          <div class="overview-card health">
            <div class="card-icon" :class="getHealthClass(overview.healthScore)">
              <i class="el-icon-star-on" />
            </div>
            <div class="card-content">
              <div class="amount">{{ overview.healthScore }}</div>
              <div class="label">财务健康度</div>
              <div class="sub-label">{{ getHealthDesc(overview.healthScore) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析标签页 -->
      <div class="analysis-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="趋势分析" name="trend">
            <TrendAnalysis
              :date-range="dateRange"
              :records="filteredRecords"
              @refresh="refreshData"
            />
          </el-tab-pane>

          <el-tab-pane label="分类分析" name="category">
            <CategoryAnalysis
              ref="categoryAnalysis"
              :date-range="dateRange"
              :records="filteredRecords"
              @refresh="refreshData"
            />
          </el-tab-pane>

          <el-tab-pane label="对比分析" name="comparison">
            <ComparisonAnalysis
              ref="comparisonAnalysis"
              :date-range="dateRange"
              :records="filteredRecords"
              @refresh="refreshData"
            />
          </el-tab-pane>

          <el-tab-pane label="习惯分析" name="habits">
            <HabitsAnalysis
              ref="habitsAnalysis"
              :date-range="dateRange"
              :records="filteredRecords"
              @refresh="refreshData"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 数据导出确认对话框 -->
    <el-dialog title="导出数据" :visible.sync="exportDialogVisible" width="400px">
      <p>确定要导出当前时间范围内的统计数据吗？</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确定导出</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TrendAnalysis from './components/TrendAnalysis.vue'
import CategoryAnalysis from './components/CategoryAnalysis.vue'
import ComparisonAnalysis from './components/ComparisonAnalysis.vue'
import HabitsAnalysis from './components/HabitsAnalysis.vue'
import { listFinanceRecords } from '@/api/finance'

export default {
  name: 'FinanceStatistics',
  components: {
    TrendAnalysis,
    CategoryAnalysis,
    ComparisonAnalysis,
    HabitsAnalysis
  },
  data() {
    return {
      activeTab: 'trend',
      dateRange: null,
      exportDialogVisible: false,
      exportType: 'json',
      records: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '最近3个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 2)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近6个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 5)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近12个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 11)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  computed: {
    recordsLocal() {
      return this.records
    },
    isEmpty() {
      return this.records.length === 0
    },
    filteredRecords() {
      if (!this.dateRange || this.dateRange.length !== 2) {
        return this.records
      }

      const [start, end] = this.dateRange
      return this.records.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= start && recordDate <= end
      })
    },
    overview() {
      const current = this.filteredRecords
      const currentIncome = current.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const currentExpense = current.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      const netIncome = currentIncome - currentExpense
      const savingRate = currentIncome > 0 ? ((netIncome / currentIncome) * 100).toFixed(1) : 0

      // 计算变化率（与前一期间对比）
      const previousPeriod = this.getPreviousPeriodRecords()
      const prevIncome = previousPeriod.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const prevExpense = previousPeriod.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)

      const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome * 100) : 0
      const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense * 100) : 0

      // 计算财务健康度
      const healthScore = this.calculateHealthScore(currentIncome, currentExpense, netIncome)

      return {
        totalIncome: currentIncome,
        totalExpense: currentExpense,
        netIncome,
        savingRate: parseFloat(savingRate),
        incomeChange,
        expenseChange,
        healthScore
      }
    }
  },
  async mounted() {
    await this.refreshData()
  },
  methods: {
    async refreshData() {
      try {
        const { records } = await listFinanceRecords({ page: 1, limit: 5000 })
        this.records = records.map(r => ({ ...r, amount: Number(r.amount) }))
      } catch (err) {
        console.error('加载财务记录失败', err)
        this.$message.error('加载记录失败')
      }
    },
    initializeDateRange() {
      // 默认选择最近6个月
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 5)
      this.dateRange = [start, end]
    },
    handleDateRangeChange(value) {
      this.dateRange = value
    },
    handleTabClick(tab) {
      if (tab.name === 'category') {
        this.$nextTick(() => {
          this.$refs.categoryAnalysis && this.$refs.categoryAnalysis.resizeCharts && this.$refs.categoryAnalysis.resizeCharts()
        })
      } else if (tab.name === 'comparison') {
        this.$nextTick(() => {
          this.$refs.comparisonAnalysis && this.$refs.comparisonAnalysis.resizeCharts && this.$refs.comparisonAnalysis.resizeCharts()
        })
      } else if (tab.name === 'habits') {
        this.$nextTick(() => {
          this.$refs.habitsAnalysis && this.$refs.habitsAnalysis.resizeCharts && this.$refs.habitsAnalysis.resizeCharts()
        })
      }
    },
    handleExport(command) {
      this.exportType = command
      this.exportDialogVisible = true
    },
    confirmExport() {
      const data = {
        exportTime: new Date().toISOString(),
        dateRange: this.dateRange,
        overview: this.overview,
        records: this.filteredRecords,
        summary: {
          totalRecords: this.filteredRecords.length,
          incomeRecords: this.filteredRecords.filter(r => r.type === 'income').length,
          expenseRecords: this.filteredRecords.filter(r => r.type === 'expense').length
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `财务统计数据_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      this.exportDialogVisible = false
      this.$message.success('数据导出成功')
    },
    generateTestData() {
      const testData = this.createTestData()
      this.records = testData
      this.$message.success('测试数据生成成功！')
      this.refreshData()
    },
    createTestData() {
      const data = []
      const today = new Date()

      // 生成6个月的数据
      for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
        const month = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

        // 每月生成15-25条记录
        const recordCount = Math.floor(Math.random() * 11) + 15

        for (let i = 0; i < recordCount; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1
          const recordDate = new Date(month.getFullYear(), month.getMonth(), day)

          // 70%概率是支出，30%概率是收入
          const isExpense = Math.random() < 0.7

          if (isExpense) {
            const categories = ['餐饮', '购物', '交通', '娱乐', '医疗', '教育', '住房', '通讯', '其他', '旅游']
            const amounts = [20, 35, 50, 80, 120, 200, 350, 500, 800, 1200]

            data.push({
              id: Date.now() + Math.random(),
              type: 'expense',
              amount: amounts[Math.floor(Math.random() * amounts.length)] + Math.floor(Math.random() * 100),
              category: categories[Math.floor(Math.random() * categories.length)],
              description: '测试数据',
              date: recordDate.toISOString().split('T')[0]
            })
          } else {
            const categories = ['工资', '奖金', '投资收益', '兼职', '其他']
            const amounts = [5000, 8000, 12000, 15000, 20000]

            data.push({
              id: Date.now() + Math.random(),
              type: 'income',
              amount: amounts[Math.floor(Math.random() * amounts.length)] + Math.floor(Math.random() * 3000),
              category: categories[Math.floor(Math.random() * categories.length)],
              description: '测试数据',
              date: recordDate.toISOString().split('T')[0]
            })
          }
        }
      }

      return data.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    getPreviousPeriodRecords() {
      if (!this.dateRange || this.dateRange.length !== 2) {
        return []
      }

      const [start, end] = this.dateRange
      const periodLength = end.getTime() - start.getTime()
      const prevStart = new Date(start.getTime() - periodLength)
      const prevEnd = new Date(start.getTime())

      return this.records.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= prevStart && recordDate < prevEnd
      })
    },
    calculateHealthScore(income, expense, netIncome) {
      let score = 0

      // 储蓄率评分（40分）
      const savingRate = income > 0 ? (netIncome / income) * 100 : 0
      if (savingRate >= 30) score += 40
      else if (savingRate >= 20) score += 30
      else if (savingRate >= 10) score += 20
      else if (savingRate >= 0) score += 10

      // 收支平衡评分（30分）
      if (netIncome > 0) score += 30
      else if (netIncome >= -income * 0.1) score += 20
      else if (netIncome >= -income * 0.2) score += 10

      // 收入稳定性评分（30分）
      const recentRecords = this.records
        .filter(r => r.type === 'income')
        .slice(0, 6) // 最近6条收入记录

      if (recentRecords.length >= 3) {
        const amounts = recentRecords.map(r => r.amount)
        const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
        const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / amounts.length
        const coefficient = Math.sqrt(variance) / avg

        if (coefficient <= 0.2) score += 30
        else if (coefficient <= 0.4) score += 20
        else if (coefficient <= 0.6) score += 10
      }

      return Math.round(score)
    },
    getHealthClass(score) {
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'poor'
    },
    getHealthDesc(score) {
      if (score >= 80) return '优秀'
      if (score >= 60) return '良好'
      if (score >= 40) return '一般'
      return '需改善'
    },
    formatAmount(amount) {
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    refreshChild() {
      this.refreshData()
    }
  }
}
</script>

<style lang="scss" scoped>
.finance-statistics {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);

  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .title-section {
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
      }

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }

  .empty-state {
    background: white;
    border-radius: 12px;
    padding: 80px;
    text-align: center;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    i {
      font-size: 64px;
      color: #667eea;
      margin-bottom: 24px;
    }

    h3 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      margin: 8px 0 32px 0;
      color: #8c92a4;
      font-size: 16px;
    }
  }

  .overview-dashboard {
    margin-bottom: 24px;

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .overview-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;

          i {
            font-size: 24px;
            color: white;
          }

          &.income, &.excellent {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.expense, &.poor {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.net, &.average {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.health, &.good {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }

        .card-content {
          flex: 1;

          .amount {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
          }

          .label {
            font-size: 14px;
            color: #8c92a4;
            margin-bottom: 4px;
          }

          .sub-label {
            font-size: 12px;
            color: #bdc3c7;
          }

          .change {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;

            &.positive {
              color: #27ae60;
            }

            &.negative {
              color: #e74c3c;
            }
          }
        }
      }
    }
  }

  .analysis-tabs {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    ::v-deep .el-tabs__header {
      margin: 0;
      padding: 0 24px;
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }

    ::v-deep .el-tabs__content {
      padding: 24px;
    }

    ::v-deep .el-tab-pane {
      min-height: 400px;
    }
  }
}

@media (max-width: 768px) {
  .finance-statistics {
    padding: 16px;

    .page-header .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .overview-grid {
      grid-template-columns: 1fr;
    }

    .header-actions {
      flex-direction: column;
      width: 100%;
      gap: 8px !important;
    }
  }
}
</style>
