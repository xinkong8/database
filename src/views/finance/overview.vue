<template>
  <div class="finance-overview">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card balance-card">
          <div class="card-header">
            <h3>总余额</h3>
            <i class="el-icon-wallet" />
          </div>
          <div class="card-value">{{ totalBalance | money }}</div>
          <div class="card-desc">
            <span :class="balanceChange >= 0 ? 'positive' : 'negative'">
              {{ balanceChange >= 0 ? '+' : '' }}{{ balanceChange | money }}
            </span>
            <span>本月变化</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card income-card">
          <div class="card-header">
            <h3>本月收入</h3>
            <i class="el-icon-upload2" />
          </div>
          <div class="card-value positive">{{ monthIncome | money }}</div>
          <div class="card-desc">
            <span class="positive">+{{ incomeGrowth }}%</span>
            <span>较上月</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card expense-card">
          <div class="card-header">
            <h3>本月支出</h3>
            <i class="el-icon-download" />
          </div>
          <div class="card-value negative">{{ monthExpense | money }}</div>
          <div class="card-desc">
            <span class="negative">+{{ expenseGrowth }}%</span>
            <span>较上月</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card saving-card">
          <div class="card-header">
            <h3>储蓄率</h3>
            <i class="el-icon-star-on" />
          </div>
          <div class="card-value">{{ savingRate }}%</div>
          <div class="card-desc">
            <span :class="savingRateChange >= 0 ? 'positive' : 'negative'">
              {{ savingRateChange >= 0 ? '+' : '' }}{{ savingRateChange }}%
            </span>
            <span>较上月</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h4>快速操作</h4>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-button type="primary" icon="el-icon-plus" block @click="quickRecord('income')">
            记录收入
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" icon="el-icon-minus" block @click="quickRecord('expense')">
            记录支出
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" icon="el-icon-view" block @click="$router.push('/finance/records')">
            查看记录
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" icon="el-icon-document" block @click="exportData">
            导出数据
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 图表和数据 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <div class="chart-section">
          <div class="section-header">
            <h4>月度趋势</h4>
            <el-radio-group v-model="chartType" size="small">
              <el-radio-button label="income">收入</el-radio-button>
              <el-radio-button label="expense">支出</el-radio-button>
              <el-radio-button label="balance">结余</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container">
            <monthly-trend-chart :data="chartData" :type="chartType" />
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="8">
        <div class="category-section">
          <div class="section-header">
            <h4>支出分类</h4>
          </div>
          <div class="chart-container">
            <expense-category-chart :data="expenseByCategory" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近记录 -->
    <div class="recent-records">
      <div class="section-header">
        <h4>最近记录</h4>
        <el-button type="text" @click="$router.push('/finance/records')">
          查看全部 <i class="el-icon-arrow-right" />
        </el-button>
      </div>
      <el-table :data="recentRecords" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="类型" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.recordType === 'income' ? 'success' : 'danger'" size="small">
              {{ scope.row.recordType === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template slot-scope="scope">
            <span :class="scope.row.recordType === 'income' ? 'positive' : 'negative'">
              {{ scope.row.recordType === 'income' ? '+' : '-' }}{{ scope.row.amount | money }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 快速记账弹窗 -->
    <quick-record-dialog
      :visible.sync="quickRecordVisible"
      :record-type="quickRecordType"
      @success="handleRecordSuccess"
    />
  </div>
</template>

<script>
import MonthlyTrendChart from './components/MonthlyTrendChart'
import ExpenseCategoryChart from './components/ExpenseCategoryChart'
import QuickRecordDialog from './components/QuickRecordDialog'

export default {
  name: 'FinanceOverview',
  components: {
    MonthlyTrendChart,
    ExpenseCategoryChart,
    QuickRecordDialog
  },
  filters: {
    money(val) {
      if (typeof val !== 'number' || isNaN(val)) return '¥0.00'
      return val.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
    }
  },
  data() {
    return {
      chartType: 'balance',
      quickRecordVisible: false,
      quickRecordType: 'expense',

      // 统计数据
      totalBalance: 0,
      monthIncome: 0,
      monthExpense: 0,
      balanceChange: 0,
      incomeGrowth: 0,
      expenseGrowth: 0,
      savingRate: 0,
      savingRateChange: 0,

      // 图表数据
      chartData: [],
      expenseByCategory: [],
      recentRecords: []
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.calcStatistics()
      this.prepareChartData()
      this.loadRecentRecords()
      this.calcExpenseByCategory()
    },

    calcStatistics() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

      // 获取所有记录
      const allRecords = this.getAllRecords()

      // 计算总余额
      const totalIncome = allRecords
        .filter(r => r.recordType === 'income')
        .reduce((sum, r) => sum + Number(r.amount), 0)
      const totalExpense = allRecords
        .filter(r => r.recordType === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0)
      this.totalBalance = totalIncome - totalExpense

      // 计算本月收支
      const currentMonthRecords = allRecords.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate.getFullYear() === currentYear &&
               recordDate.getMonth() + 1 === currentMonth
      })

      this.monthIncome = currentMonthRecords
        .filter(r => r.recordType === 'income')
        .reduce((sum, r) => sum + Number(r.amount), 0)

      this.monthExpense = currentMonthRecords
        .filter(r => r.recordType === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0)

      // 计算上月数据用于对比
      const lastMonthRecords = allRecords.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate.getFullYear() === lastMonthYear &&
               recordDate.getMonth() + 1 === lastMonth
      })

      const lastMonthIncome = lastMonthRecords
        .filter(r => r.recordType === 'income')
        .reduce((sum, r) => sum + Number(r.amount), 0)

      const lastMonthExpense = lastMonthRecords
        .filter(r => r.recordType === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0)

      // 计算变化
      this.balanceChange = (this.monthIncome - this.monthExpense) - (lastMonthIncome - lastMonthExpense)
      this.incomeGrowth = lastMonthIncome > 0
        ? Math.round(((this.monthIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0
      this.expenseGrowth = lastMonthExpense > 0
        ? Math.round(((this.monthExpense - lastMonthExpense) / lastMonthExpense) * 100) : 0

      // 计算储蓄率
      this.savingRate = this.monthIncome > 0
        ? Math.round(((this.monthIncome - this.monthExpense) / this.monthIncome) * 100) : 0

      const lastMonthSavingRate = lastMonthIncome > 0
        ? Math.round(((lastMonthIncome - lastMonthExpense) / lastMonthIncome) * 100) : 0

      this.savingRateChange = this.savingRate - lastMonthSavingRate
    },

    prepareChartData() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const allRecords = this.getAllRecords()

      // 生成过去12个月的数据
      this.chartData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(currentYear, now.getMonth() - i, 1)
        const year = date.getFullYear()
        const month = date.getMonth() + 1

        const monthRecords = allRecords.filter(r => {
          const recordDate = new Date(r.date)
          return recordDate.getFullYear() === year &&
                 recordDate.getMonth() + 1 === month
        })

        const income = monthRecords
          .filter(r => r.recordType === 'income')
          .reduce((sum, r) => sum + Number(r.amount), 0)

        const expense = monthRecords
          .filter(r => r.recordType === 'expense')
          .reduce((sum, r) => sum + Number(r.amount), 0)

        return {
          month: `${year}-${month.toString().padStart(2, '0')}`,
          income,
          expense,
          balance: income - expense
        }
      }).reverse()
    },

    calcExpenseByCategory() {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const allRecords = this.getAllRecords()
      const currentMonthExpenses = allRecords.filter(r => {
        const recordDate = new Date(r.date)
        return r.recordType === 'expense' &&
               recordDate.getFullYear() === currentYear &&
               recordDate.getMonth() + 1 === currentMonth
      })

      const categoryStats = {}
      currentMonthExpenses.forEach(record => {
        const category = record.category || '其他'
        categoryStats[category] = (categoryStats[category] || 0) + Number(record.amount)
      })

      this.expenseByCategory = Object.entries(categoryStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    },

    loadRecentRecords() {
      const allRecords = this.getAllRecords()
      this.recentRecords = allRecords
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
    },

    getAllRecords() {
      // 统一使用financeRecords作为数据存储键名
      const records = localStorage.getItem('financeRecords')
      return records ? JSON.parse(records) : []
    },

    quickRecord(type) {
      this.quickRecordType = type
      this.quickRecordVisible = true
    },

    handleRecordSuccess() {
      this.loadData()
      this.$message.success('记录添加成功')
    },

    exportData() {
      const allRecords = this.getAllRecords()
      const csvContent = this.convertToCSV(allRecords)
      this.downloadCSV(csvContent, `财务记录_${new Date().toISOString().split('T')[0]}.csv`)
    },

    convertToCSV(data) {
      if (!data.length) return ''

      const headers = ['日期', '类型', '分类', '金额', '备注']
      const rows = data.map(record => [
        record.date,
        record.recordType === 'income' ? '收入' : '支出',
        record.category,
        record.amount,
        record.description
      ])

      return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    },

    downloadCSV(content, filename) {
      const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.finance-overview {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);

  // 统计卡片
  .stats-cards {
    margin-bottom: 32px;

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      height: 120px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          margin: 0;
          font-size: 14px;
          color: #8c92a4;
          font-weight: 500;
        }

        i {
          font-size: 24px;
        }
      }

      .card-value {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #2c3e50;
      }

      .card-desc {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #8c92a4;
      }

      // 卡片特定颜色
      &.balance-card .card-header i { color: #667eea; }
      &.income-card .card-header i { color: #27ae60; }
      &.expense-card .card-header i { color: #e74c3c; }
      &.saving-card .card-header i { color: #f39c12; }
    }
  }

  // 快速操作
  .quick-actions {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    h4 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
    }
  }

  // 图表区域
  .chart-section, .category-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    height: 400px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h4 {
        margin: 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .chart-container {
      height: calc(100% - 60px);
    }
  }

  // 最近记录
  .recent-records {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h4 {
        margin: 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  // 通用样式
  .positive {
    color: #27ae60;
    font-weight: 600;
  }

  .negative {
    color: #e74c3c;
    font-weight: 600;
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 16px;

    .stats-cards {
      margin-bottom: 24px;

      .stat-card {
        margin-bottom: 16px;
        padding: 20px;
        height: auto;

        .card-value {
          font-size: 20px;
        }
      }
    }

    .quick-actions {
      padding: 20px;
      margin-bottom: 24px;

      .el-col {
        margin-bottom: 12px;
      }
    }

    .chart-section, .category-section {
      padding: 20px;
      height: 300px;
    }

    .recent-records {
      padding: 20px;
    }
  }

  @media (max-width: 576px) {
    .stats-cards .stat-card {
      .card-header h3 {
        font-size: 12px;
      }
      .card-value {
        font-size: 18px;
      }
    }
  }
}

// 全局表格样式覆盖
::v-deep .el-table {
  .el-table__header {
    th {
      background-color: #fafbfc;
      color: #606266;
      font-weight: 600;
      border-bottom: 1px solid #ebeef5;
    }
  }

  .el-table__body {
    tr:hover {
      background-color: #f8f9fa;
    }
  }
}

// 按钮组样式
::v-deep .el-radio-group {
  .el-radio-button__inner {
    border-radius: 6px;
    margin-right: 8px;
    border: 1px solid #d1d5db;

    &:first-child {
      border-radius: 6px;
    }

    &:last-child {
      border-radius: 6px;
    }
  }

  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    background-color: #667eea;
    border-color: #667eea;
    color: white;
  }
}
</style>
