<template>
  <el-dialog
    :title="recordType === 'income' ? '快速记录收入' : '快速记录支出'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="金额" prop="amount">
        <el-input
          v-model="form.amount"
          type="number"
          placeholder="请输入金额"
          prefix-icon="el-icon-money"
          clearable
          autofocus
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

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          placeholder="请输入描述（可选）"
          clearable
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createFinanceRecord } from '@/api/finance'

export default {
  name: 'QuickRecordDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    recordType: {
      type: String,
      default: 'expense',
      validator: value => ['income', 'expense'].includes(value)
    }
  },
  data() {
    return {
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
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    categories() {
      return this.recordType === 'expense'
        ? ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他']
        : ['工资', '奖金', '投资', '兼职', '礼金', '其他']
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetForm()
      }
    },
    recordType() {
      this.form.category = ''
    }
  },
  methods: {
    getAllRecords() {
      const records = localStorage.getItem('financeRecords')
      return records ? JSON.parse(records) : []
    },

    getDefaultCategory() {
      return this.categories[0] || ''
    },

    async saveRecord(record) {
      await createFinanceRecord({
        ...record,
        type: this.recordType
      })
    },

    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitting = true

          this.saveRecord({ ...this.form })
            .then(() => {
              this.$message.success(`${this.recordType === 'income' ? '收入' : '支出'}记录保存成功`)
              this.$emit('success')
              this.handleClose()
            })
            .catch(err => {
              console.error('保存记录失败', err)
              this.$message.error('保存失败')
            })
            .finally(() => {
              this.submitting = false
            })
        }
      })
    },

    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        amount: '',
        category: this.getDefaultCategory(),
        date: new Date().toISOString().split('T')[0],
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}

::v-deep .el-dialog__body {
  padding: 20px 20px 10px 20px;
}
</style>
