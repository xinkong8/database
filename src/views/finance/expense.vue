<template>
  <div>
    <el-form :inline="true" :model="form" class="demo-form-inline" @submit.native.prevent="addExpense">
      <el-form-item label="日期">
        <el-date-picker v-model="form.date" type="date" placeholder="选择日期" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type" placeholder="请选择类型" style="width:120px">
          <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="金额">
        <el-input v-model.number="form.amount" placeholder="输入金额" type="number" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" placeholder="备注" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addExpense">添加支出</el-button>
      </el-form-item>
    </el-form>
    <div style="max-height: 500px; overflow-y: auto; margin-top:20px;">
      <el-table :data="expenseList" style="min-width: 100%" height="500" header-row-class-name="fixed-header">
        <el-table-column prop="date" label="日期" width="150" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </div>
    <div style="margin-top: 40px; background: #fff; padding: 16px; border-radius: 4px;">
      <ExpensePieChart :data-list="expenseList" />
    </div>
  </div>
</template>

<script>
import ExpensePieChart from './ExpensePieChart.vue'
import { listFinanceRecords, createFinanceRecord } from '@/api/finance'

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

const typeOptions = ['餐饮', '购物', '日用', '交通', '蔬菜', '水果', '零食', '运动', '娱乐', '通讯', '服饰', '美容', '住房', '家庭', '社交', '旅行', '其他']

export default {
  name: 'Expense',
  components: { ExpensePieChart },
  data() {
    return {
      form: {
        date: '',
        type: '',
        amount: null,
        remark: ''
      },
      typeOptions,
      expenseList: []
    }
  },
  async mounted() {
    await this.fetchExpenseList()
  },
  methods: {
    async fetchExpenseList() {
      try {
        const { records } = await listFinanceRecords({ page: 1, limit: 100, type: 'expense' })
        this.expenseList = records.map(r => ({
          date: r.date,
          type: r.category,
          amount: Number(r.amount),
          remark: r.description || ''
        }))
      } catch (err) {
        console.error('加载支出记录失败', err)
      }
    },
    async addExpense() {
      if (!this.form.date || !this.form.amount || !this.form.type) {
        this.$message.error('请填写完整信息')
        return
      }
      try {
        await createFinanceRecord({
          date: formatDate(this.form.date),
          category: this.form.type,
          amount: this.form.amount,
          description: this.form.remark,
          type: 'expense'
        })
        this.$message.success('添加成功')
        this.form = { date: '', type: '', amount: null, remark: '' }
        await this.fetchExpenseList()
      } catch (err) {
        console.error('添加支出失败', err)
        this.$message.error('添加失败')
      }
    }
  }
}
</script>
