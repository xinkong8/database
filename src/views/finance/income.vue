<template>
  <div>
    <el-form :inline="true" :model="form" class="demo-form-inline" @submit.native.prevent="addIncome">
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
        <el-button type="primary" @click="addIncome">添加收入</el-button>
      </el-form-item>
    </el-form>
    <div style="max-height: 500px; overflow-y: auto; margin-top:20px;">
      <el-table :data="incomeList" style="min-width: 100%" height="500" header-row-class-name="fixed-header">
        <el-table-column prop="date" label="日期" width="150" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </div>
    <div style="margin-top: 40px; background: #fff; padding: 16px; border-radius: 4px;">
      <IncomePieChart :data-list="incomeList" />
    </div>
  </div>
</template>

<script>
import IncomePieChart from './IncomePieChart.vue'
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

const typeOptions = ['工资', '红包', '租金', '礼金', '分红', '理财', '年终奖', '其他']

export default {
  name: 'Income',
  components: { IncomePieChart },
  data() {
    return {
      form: {
        date: '',
        type: '',
        amount: null,
        remark: ''
      },
      typeOptions,
      incomeList: JSON.parse(localStorage.getItem('incomeList') || '[]')
    }
  },
  methods: {
    addIncome() {
      if (!this.form.date || !this.form.amount || !this.form.type) {
        this.$message.error('请填写完整信息')
        return
      }
      const record = { ...this.form, date: formatDate(this.form.date) }
      this.incomeList.push(record)
      localStorage.setItem('incomeList', JSON.stringify(this.incomeList))
      this.form = { date: '', type: '', amount: null, remark: '' }
      this.$message.success('添加成功')
    }
  }
}
</script>
