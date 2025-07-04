<template>
  <div class="finance-record">
    <div class="page-header">
      <h2>记账</h2>
      <p>快速记录收入和支出</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <el-card class="record-form-card">
          <div slot="header">
            <el-radio-group v-model="recordType" @change="resetForm">
              <el-radio-button label="expense">支出</el-radio-button>
              <el-radio-button label="income">收入</el-radio-button>
            </el-radio-group>
          </div>

          <el-form ref="recordForm" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="金额" prop="amount">
              <el-input
                v-model="form.amount"
                type="number"
                placeholder="请输入金额"
                prefix-icon="el-icon-money"
                clearable
              />
            </el-form-item>

            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="category in categories"
                  :key="category"
                  :label="category"
                  :value="category"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>

            <el-form-item label="描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="请输入描述（可选）"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submitForm">
                保存记录
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="quick-stats">
          <div slot="header">今日统计</div>
          <div class="stat-item">
            <span class="label">今日收入：</span>
            <span class="value positive">{{ todayIncome | money }}</span>
          </div>
          <div class="stat-item">
            <span class="label">今日支出：</span>
            <span class="value negative">{{ todayExpense | money }}</span>
          </div>
          <div class="stat-item">
            <span class="label">今日结余：</span>
            <span class="value" :class="todayBalance >= 0 ? 'positive' : 'negative'">
              {{ todayBalance | money }}
            </span>
          </div>
        </el-card>

        <el-card class="recent-records" style="margin-top: 20px;">
          <div slot="header">最近记录</div>
          <div v-if="recentRecords.length === 0" class="no-data">
            暂无记录
          </div>
          <div v-else>
            <div
              v-for="record in recentRecords.slice(0, 5)"
              :key="record.id"
              class="record-item"
            >
              <div class="record-info">
                <div class="record-desc">{{ record.description || record.category }}</div>
                <div class="record-date">{{ record.date }}</div>
              </div>
              <div class="record-amount" :class="record.recordType === 'income' ? 'positive' : 'negative'">
                {{ record.recordType === 'income' ? '+' : '-' }}{{ record.amount | money }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'FinanceRecord',
  filters: {
    money(val) {
      // 处理字符串和数字格式的金额
      const num = typeof val === 'string' ? parseFloat(val) : val
      if (typeof num !== 'number' || isNaN(num)) return '¥0.00'
      return num.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
    }
  },
  data() {
    return {
      recordType: 'expense',
      submitting: false,
      form: {
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      },
      rules: {
        amount: [
          { required: true, message: '请输入金额', trigger: 'blur' },
          { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ]
      },
      recentRecords: []
    }
  },
  computed: {
    categories() {
      return this.recordType === 'expense'
        ? ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他']
        : ['工资', '奖金', '投资', '兼职', '礼金', '其他']
    },
    todayIncome() {
      return this.getTodayRecords('income').reduce((sum, r) => sum + Number(r.amount), 0)
    },
    todayExpense() {
      return this.getTodayRecords('expense').reduce((sum, r) => sum + Number(r.amount), 0)
    },
    todayBalance() {
      return this.todayIncome - this.todayExpense
    }
  },
  created() {
    this.loadRecentRecords()
  },
  methods: {
    getTodayRecords(type) {
      const today = new Date().toISOString().split('T')[0]
      const allRecords = this.getAllRecords()
      return allRecords.filter(r => r.date === today && r.recordType === type)
    },

    getAllRecords() {
      // 模拟从localStorage或API获取数据
      const records = localStorage.getItem('financeRecords')
      return records ? JSON.parse(records) : []
    },

    saveRecord(record) {
      const records = this.getAllRecords()
      record.id = Date.now().toString()
      record.recordType = this.recordType
      records.unshift(record)
      localStorage.setItem('financeRecords', JSON.stringify(records))
    },

    loadRecentRecords() {
      this.recentRecords = this.getAllRecords().slice(0, 10)
    },

    submitForm() {
      this.$refs.recordForm.validate(valid => {
        if (valid) {
          this.submitting = true

          setTimeout(() => {
            this.saveRecord({ ...this.form })
            this.loadRecentRecords()
            this.$message.success('记录保存成功')
            this.resetForm()
            this.submitting = false
          }, 500)
        }
      })
    },

    resetForm() {
      this.form = {
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.recordForm && this.$refs.recordForm.clearValidate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.finance-record {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  h2 {
    margin: 0 0 8px 0;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.record-form-card {
  .el-radio-group {
    .el-radio-button__inner {
      padding: 8px 20px;
    }
  }
}

.quick-stats {
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #666;
      font-size: 14px;
    }

    .value {
      font-weight: 600;
      font-size: 16px;

      &.positive {
        color: #67c23a;
      }

      &.negative {
        color: #f56c6c;
      }
    }
  }
}

.recent-records {
  .no-data {
    text-align: center;
    color: #999;
    padding: 20px 0;
  }

  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .record-info {
      flex: 1;

      .record-desc {
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
      }

      .record-date {
        font-size: 12px;
        color: #999;
      }
    }

    .record-amount {
      font-weight: 600;
      font-size: 14px;

      &.positive {
        color: #67c23a;
      }

      &.negative {
        color: #f56c6c;
      }
    }
  }
}

@media (max-width: 768px) {
  .finance-record {
    padding: 10px;
  }
}
</style>
