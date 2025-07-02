<template>
  <div class="expense-form">
    <el-form
      ref="expenseForm"
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
          <el-form-item label="支出类型" prop="category">
            <el-select
              v-model="form.category"
              placeholder="选择类型"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option
                v-for="category in expenseCategories"
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
              {{ submitting ? '保存中...' : '添加支出' }}
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

    <!-- 常用支出类型快捷按钮 -->
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
  name: 'ExpenseForm',
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
          { required: true, message: '请选择支出类型', trigger: 'change' }
        ],
        amount: [
          { required: true, message: '请输入金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
        ]
      },
      expenseCategories: [
        // 饮食
        '餐饮', '早餐', '午餐', '晚餐', '夜宵', '饮料', '零食', '水果',
        // 购物
        '购物', '服饰', '鞋包', '化妆品', '日用品', '家电', '数码产品',
        // 交通
        '交通', '公交', '地铁', '打车', '加油', '停车费', '过路费',
        // 住房
        '住房', '房租', '房贷', '物业费', '水费', '电费', '燃气费', '宽带费',
        // 娱乐
        '娱乐', '电影', '游戏', 'KTV', '旅游', '运动', '健身',
        // 医疗
        '医疗', '挂号费', '药费', '体检', '保险',
        // 教育
        '教育', '学费', '培训费', '书籍', '文具',
        // 社交
        '社交', '聚餐', '礼品', '红包',
        // 其他
        '通讯费', '美容', '维修', '捐赠', '其他支出'
      ],
      commonCategories: ['餐饮', '交通', '购物', '娱乐', '住房'],
      quickAmounts: [10, 20, 50, 100, 200, 500]
    }
  },
  methods: {
    async submitForm() {
      try {
        await this.$refs.expenseForm.validate()

        this.submitting = true

        const record = {
          date: this.formatDate(this.form.date),
          type: this.form.category,
          amount: this.form.amount,
          remark: this.form.description || '',
          createdAt: new Date().toISOString()
        }

        // 保存到localStorage
        const existingData = JSON.parse(localStorage.getItem('expenseList') || '[]')
        existingData.push(record)
        localStorage.setItem('expenseList', JSON.stringify(existingData))

        // 延迟一下模拟保存过程
        await new Promise(resolve => setTimeout(resolve, 300))

        this.$emit('success', record)
        this.resetForm()
      } catch (error) {
        console.error('保存支出记录失败:', error)
        this.$message.error('保存失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    resetForm() {
      if (this.$refs.expenseForm) {
        this.$refs.expenseForm.resetFields()
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
.expense-form {
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
        background-color: #e74c3c;
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
