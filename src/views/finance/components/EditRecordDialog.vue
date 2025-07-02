<template>
  <el-dialog
    :title="isEdit ? '编辑预算' : '设置预算'"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="budgetForm"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="预算月份">
        <el-date-picker
          v-model="form.month"
          type="month"
          placeholder="选择月份"
          format="yyyy年MM月"
          value-format="yyyy-MM"
          style="width: 100%"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select
          v-model="form.category"
          placeholder="选择分类"
          style="width: 100%"
          :disabled="isEdit"
        >
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="预算金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="0"
          :precision="2"
          style="width: 100%"
          placeholder="请输入预算金额"
        >
          <template slot="prepend">¥</template>
        </el-input-number>
      </el-form-item>

      <el-form-item label="预算类型">
        <el-radio-group v-model="form.alertLevel">
          <el-radio :label="1">宽松 (超支提醒阈值: 110%)</el-radio>
          <el-radio :label="2">适中 (超支提醒阈值: 100%)</el-radio>
          <el-radio :label="3">严格 (超支提醒阈值: 90%)</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.note"
          type="textarea"
          placeholder="预算说明（可选）"
          :rows="3"
        />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="重复设置">
        <el-checkbox v-model="form.autoRepeat">自动为未来月份设置相同预算</el-checkbox>
        <div v-if="form.autoRepeat" style="margin-top: 8px;">
          <el-input-number
            v-model="form.repeatMonths"
            :min="1"
            :max="12"
            placeholder="重复月数"
          /> 个月
        </div>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ isEdit ? '更新' : '保存' }}
      </el-button>
      <el-button v-if="isEdit" type="danger" @click="handleDelete">
        删除
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'EditBudgetDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    budget: {
      type: Object,
      default: () => ({})
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      saving: false,
      form: {
        month: '',
        category: '',
        amount: 0,
        alertLevel: 2,
        note: '',
        autoRepeat: false,
        repeatMonths: 3
      },
      rules: {
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        amount: [
          { required: true, message: '请输入预算金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '预算金额必须大于0', trigger: 'blur' }
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
    isEdit() {
      return this.budget && this.budget.id
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    },
    budget: {
      handler() {
        if (this.visible) {
          this.initForm()
        }
      },
      deep: true
    }
  },
  methods: {
    initForm() {
      if (this.isEdit) {
        this.form = { ...this.budget }
      } else {
        this.form = {
          month: new Date().toISOString().slice(0, 7),
          category: '',
          amount: 0,
          alertLevel: 2,
          note: '',
          autoRepeat: false,
          repeatMonths: 3
        }
      }
    },

    handleClose() {
      this.dialogVisible = false
      this.$refs.budgetForm?.resetFields()
    },

    handleSave() {
      this.$refs.budgetForm.validate((valid) => {
        if (valid) {
          this.saving = true

          // 模拟保存延迟
          setTimeout(() => {
            const budgetData = { ...this.form }

            if (!this.isEdit) {
              budgetData.id = Date.now().toString()
              budgetData.createdAt = new Date().toISOString()
            }
            budgetData.updatedAt = new Date().toISOString()

            // 如果设置了自动重复，生成多个月的预算
            if (budgetData.autoRepeat && !this.isEdit) {
              const budgets = []
              for (let i = 0; i < budgetData.repeatMonths; i++) {
                const date = new Date(budgetData.month + '-01')
                date.setMonth(date.getMonth() + i)
                const monthStr = date.toISOString().slice(0, 7)

                budgets.push({
                  ...budgetData,
                  id: Date.now().toString() + '_' + i,
                  month: monthStr
                })
              }
              this.$emit('save', budgets)
            } else {
              this.$emit('save', budgetData)
            }

            this.saving = false
            this.handleClose()
          }, 500)
        }
      })
    },

    handleDelete() {
      this.$confirm('确定要删除这个预算吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete', this.budget)
        this.handleClose()
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 10px;
  }
}

::v-deep .el-input-number {
  width: 100%;
}
</style>
