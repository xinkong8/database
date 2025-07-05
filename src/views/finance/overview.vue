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
import { fetchFinanceOverview } from '@/api/dashboard'
import { listFinanceRecords } from '@/api/finance'
import { export_json_to_excel } from '@/vendor/Export2Excel'

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
  async mounted() {
    await this.loadOverview()
  },
  methods: {
    async loadOverview() {
      try {
        const data = await fetchFinanceOverview()
        this.totalBalance = data.balance
        this.monthIncome = data.monthlyIncome
        this.monthExpense = data.monthlyExpense
        // 上月数据用于增长率计算
        const lastMonthDate = new Date()
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
        const lastMonthStr = lastMonthDate.toISOString().slice(0, 7)

        const lastMonthRecords = await listFinanceRecords({ limit: 1000, page: 1, startDate: `${lastMonthStr}-01`, endDate: `${lastMonthStr}-31` })
        const lastIncome = lastMonthRecords.records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0)
        const lastExpense = lastMonthRecords.records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)

        this.incomeGrowth = lastIncome === 0 ? 0 : Math.round(((this.monthIncome - lastIncome) / lastIncome) * 100)
        this.expenseGrowth = lastExpense === 0 ? 0 : Math.round(((this.monthExpense - lastExpense) / lastExpense) * 100)
        this.balanceChange = data.monthlyBalance
        this.savingRate = this.monthIncome === 0 ? 0 : Math.round(((this.monthIncome - this.monthExpense) / this.monthIncome) * 100)
        this.savingRateChange = 0 // 计算可选

        this.recentRecords = data.recentRecords.map(r => ({
          date: r.date,
          recordType: r.type,
          category: r.category,
          description: r.description,
          amount: Number(r.amount)
        }))

        // 分类统计
        const categoryMap = {}
        data.recentRecords.forEach(r => {
          if (r.type === 'expense') {
            categoryMap[r.category] = (categoryMap[r.category] || 0) + Number(r.amount)
          }
        })
        this.expenseByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

        // 月度趋势数据
        const recordsAll = await listFinanceRecords({ limit: 1000, page: 1 })
        const trendMap = {}
        recordsAll.records.forEach(r => {
          const ym = r.date.slice(0, 7)
          if (!trendMap[ym]) trendMap[ym] = { income: 0, expense: 0 }
          trendMap[ym][r.type] += Number(r.amount)
        })
        this.chartData = Object.entries(trendMap).sort((a, b) => a[0] > b[0] ? 1 : -1).map(([month, v]) => ({ month, income: v.income, expense: v.expense, balance: v.income - v.expense }))
      } catch (err) {
        console.error('加载概览失败', err)
        this.$message.error('加载概览失败')
      }
    },
    quickRecord(type) {
      this.quickRecordType = type
      this.quickRecordVisible = true
    },
    handleRecordSuccess() {
      this.loadOverview()
    },
    async exportData() {
      try {
        const { records } = await listFinanceRecords({ page: 1, limit: 5000 })
        const data = records.map(r => [r.date, r.type === 'income' ? '收入' : '支出', r.category, Number(r.amount), r.description || ''])
        const header = ['日期', '类型', '分类', '金额', '备注']
        export_json_to_excel({ header, data, filename: '财务记录_' + new Date().toISOString().slice(0, 10) })
      } catch (err) {
        console.error('导出失败', err)
        this.$message.error('导出失败')
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
