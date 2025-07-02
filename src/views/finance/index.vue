<template>
  <div class="finance-container">
    <div class="summary-card">
      <div class="summary-header">
        <span class="summary-title">本年结余</span>
        <span class="summary-balance">{{ yearBalance | money }}</span>
      </div>
      <div class="summary-row">
        <span>本年收入</span>
        <el-progress :percentage="incomePercent" :stroke-width="16" status="success" :show-text="false" />
        <span class="summary-amount">{{ yearIncome | money }}</span>
      </div>
      <div class="summary-row">
        <span>本年支出</span>
        <el-progress :percentage="expensePercent" :stroke-width="16" status="exception" :show-text="false" />
        <span class="summary-amount">{{ yearExpense | money }}</span>
      </div>
    </div>
    <div class="bill-list">
      <el-table :data="billList" style="margin-top:24px;">
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="income" label="收入" />
        <el-table-column prop="expense" label="支出" />
        <el-table-column prop="balance" label="结余" />
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinanceIndex',
  filters: {
    money(val) {
      return typeof val === 'number' ? val.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) : val
    }
  },
  data() {
    return {
      yearIncome: 0,
      yearExpense: 0,
      yearBalance: 0,
      incomePercent: 0,
      expensePercent: 0,
      billList: []
    }
  },
  created() {
    this.calcSummary()
    this.calcBillList()
  },
  methods: {
    calcSummary() {
      const year = new Date().getFullYear()
      const incomeList = JSON.parse(localStorage.getItem('incomeList') || '[]')
      const expenseList = JSON.parse(localStorage.getItem('expenseList') || '[]')
      this.yearIncome = incomeList.filter(i => i.date && i.date.startsWith(year)).reduce((sum, i) => sum + Number(i.amount), 0)
      this.yearExpense = expenseList.filter(e => e.date && e.date.startsWith(year)).reduce((sum, e) => sum + Number(e.amount), 0)
      this.yearBalance = this.yearIncome - this.yearExpense
      const max = Math.max(this.yearIncome, this.yearExpense, 1)
      this.incomePercent = Math.round(this.yearIncome / max * 100)
      this.expensePercent = Math.round(this.yearExpense / max * 100)
    },
    calcBillList() {
      const year = new Date().getFullYear()
      const incomeList = JSON.parse(localStorage.getItem('incomeList') || '[]')
      const expenseList = JSON.parse(localStorage.getItem('expenseList') || '[]')
      const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
      this.billList = months.map(month => {
        const monthIncome = incomeList.filter(i => i.date && i.date.startsWith(`${year}-${month}`)).reduce((sum, i) => sum + Number(i.amount), 0)
        const monthExpense = expenseList.filter(e => e.date && e.date.startsWith(`${year}-${month}`)).reduce((sum, e) => sum + Number(e.amount), 0)
        return {
          month: `${year}-${month}`,
          income: monthIncome,
          expense: monthExpense,
          balance: monthIncome - monthExpense
        }
      })
    }
  }
}
</script>

<style scoped>
.finance-container {
  padding: 24px;
}
.summary-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px #f0f1f2;
  padding: 24px;
  margin-bottom: 24px;
}
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.summary-title {
  font-size: 18px;
  font-weight: bold;
}
.summary-balance {
  font-size: 22px;
  color: #409EFF;
  font-weight: bold;
}
</style>
