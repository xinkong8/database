<template>
  <div class="income-form">
    <el-form
      ref="incomeForm"
      :model="form"
      :rules="rules"
      @submit.native.prevent="submitForm"
    >
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="收入类型" prop="category">
            <el-select
              v-model="form.category"
              placeholder="选择类型"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option
                v-for="category in incomeCategories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="金额" prop="amount">
            <el-input
              v-model.number="form.amount"
              placeholder="输入金额"
              type="number"
              step="0.01"
              style="width: 100%"
            >
              <template slot="prepend">¥</template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-form-item label="操作">
            <el-button type="primary" :loading="submitting" @click="submitForm">
              {{ submitting ? '保存中...' : '添加收入' }}
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="form.description"
              placeholder="添加备注（可选）"
              type="textarea"
              :rows="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 常用收入类型快捷按钮 -->
    <div class="quick-categories">
      <span class="quick-label">常用类型：</span>
      <el-tag
        v-for="category in commonCategories"
        :key="category"
        class="category-tag"
        @click="setCategory(category)"
      >
        {{ category }}
      </el-tag>
    </div>

    <!-- 快速金额按钮 -->
    <div class="quick-amounts">
      <span class="quick-label">快速金额：</span>
      <el-button
        v-for="amount in quickAmounts"
        :key="amount"
        size="small"
        @click="setAmount(amount)"
      >
        ¥{{ amount }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IncomeForm',
  data() {
    return {
      submitting: false,
      form: {
        date: new Date(),
        category: '',
        amount: null,
        description: ''
      },
      rules: {
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择收入类型', trigger: 'change' }
        ],
        amount: [
          { required: true, message: '请输入金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
        ]
      },
      incomeCategories: [
        '工资', '奖金', '年终奖', '津贴', '补贴',
        '投资收益', '股票', '基金', '理财产品',
        '兼职', '外包', '咨询费', '培训费',
        '红包', '礼金', '转账',
        '退款', '返现', '积分兑换',
        '租金收入', '版权收入',
        '其他收入'
      ],
      commonCategories: ['工资', '奖金', '投资收益', '兼职', '红包'],
      quickAmounts: [100, 500, 1000, 2000, 5000, 10000]
    }
  },
  methods: {
    async submitForm() {
      try {
        await this.$refs.incomeForm.validate()

        this.submitting = true

        const record = {
          date: this.formatDate(this.form.date),
          type: this.form.category,
          amount: this.form.amount,
          remark: this.form.description || '',
          createdAt: new Date().toISOString()
        }

        // 保存到localStorage
        const existingData = JSON.parse(localStorage.getItem('incomeList') || '[]')
        existingData.push(record)
        localStorage.setItem('incomeList', JSON.stringify(existingData))

        // 延迟一下模拟保存过程
        await new Promise(resolve => setTimeout(resolve, 300))

        this.$emit('success', record)
        this.resetForm()
      } catch (error) {
        console.error('保存收入记录失败:', error)
        this.$message.error('保存失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    resetForm() {
      if (this.$refs.incomeForm) {
        this.$refs.incomeForm.resetFields()
      }
      this.form = {
        date: new Date(),
        category: '',
        amount: null,
        description: ''
      }
    },

    setCategory(category) {
      this.form.category = category
    },

    setAmount(amount) {
      this.form.amount = amount
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const day = d.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.income-form {
  .quick-categories, .quick-amounts {
    margin-top: 20px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .quick-label {
      font-size: 14px;
      color: #606266;
      margin-right: 12px;
      white-space: nowrap;
    }

    .category-tag {
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: #667eea;
        color: white;
      }
    }

    .el-button {
      min-width: 60px;
      padding: 5px 12px;
      font-size: 12px;
    }
  }

  @media (max-width: 768px) {
    .quick-categories, .quick-amounts {
      .quick-label {
        width: 100%;
        margin-bottom: 8px;
      }
    }
  }
}

::v-deep .el-form-item {
  margin-bottom: 18px;

  .el-form-item__label {
    color: #606266;
    font-weight: 500;
    font-size: 14px;
  }
}

::v-deep .el-input-group__prepend {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #909399;
}
</style>
