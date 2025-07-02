<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="budgetForm" :model="form" :rules="rules" label-width="100px">
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
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.note"
          type="textarea"
          placeholder="预算说明（可选）"
          :rows="3"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <div v-if="isEdit" class="left-actions">
        <el-button type="danger" @click="handleDelete">
          <i class="el-icon-delete" />
          删除预算
        </el-button>
      </div>
      <div class="right-actions">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </div>
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
      default: () => null
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
        note: ''
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
      return this.budget && this.budget.category && this.budget.month
    },
    dialogTitle() {
      return this.isEdit ? '编辑预算' : '新增预算'
    }
  },
  watch: {
    visible(val) {
      if (val && this.budget) {
        this.form = { ...this.budget }
      } else if (val) {
        this.resetForm()
      }
    }
  },
  methods: {
    handleSave() {
      this.$refs.budgetForm.validate((valid) => {
        if (valid) {
          this.saving = true

          // 模拟保存延迟
          setTimeout(() => {
            this.$emit('save', { ...this.form })
            this.saving = false
            this.handleClose()
          }, 500)
        }
      })
    },

    async handleDelete() {
      try {
        await this.$confirm('确定要删除这个预算吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.$emit('delete', { ...this.form })
        this.handleClose()
      } catch (error) {
        // 用户取消删除
      }
    },

    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        month: new Date().toISOString().slice(0, 7),
        category: '',
        amount: 0,
        note: ''
      }
      this.$nextTick(() => {
        this.$refs.budgetForm && this.$refs.budgetForm.clearValidate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left-actions {
    flex: 1;
  }

  .right-actions {
    display: flex;
    gap: 10px;
  }
}

::v-deep .el-dialog__body {
  padding: 20px 20px 10px 20px;
}
</style>
