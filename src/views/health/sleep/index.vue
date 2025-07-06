<template>
  <div class="sleep-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">🌙 睡眠监控</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
        添加睡眠记录
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-time" />
          </div>
          <div class="stats-content">
            <h3>平均睡眠</h3>
            <p class="value">{{ averageSleep }} 小时</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-star-on" />
          </div>
          <div class="stats-content">
            <h3>睡眠质量</h3>
            <p class="value">{{ averageQuality }}/5</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-sunset" />
          </div>
          <div class="stats-content">
            <h3>平均就寝</h3>
            <p class="value">{{ averageBedtime }}</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-sunrise" />
          </div>
          <div class="stats-content">
            <h3>平均起床</h3>
            <p class="value">{{ averageWakeup }}</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 睡眠记录列表 -->
    <el-card class="records-card">
      <div slot="header" class="clearfix">
        <span>睡眠记录</span>
        <el-input
          v-model="searchText"
          placeholder="搜索记录..."
          prefix-icon="el-icon-search"
          style="width: 200px; float: right;"
          clearable
        />
      </div>

      <el-table
        v-loading="sleepLoading"
        :data="filteredRecords"
        style="width: 100%"
      >
        <el-table-column prop="date" label="日期" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>

        <el-table-column prop="bedtime" label="就寝时间" width="120">
          <template slot-scope="scope">
            <span class="time-value">{{ scope.row.bedtime }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="wakeup" label="起床时间" width="120">
          <template slot-scope="scope">
            <span class="time-value">{{ scope.row.wakeup }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="睡眠时长" width="120">
          <template slot-scope="scope">
            <span class="duration-value">{{ scope.row.duration || '--' }} 小时</span>
          </template>
        </el-table-column>

        <el-table-column prop="quality" label="睡眠质量" width="140">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.quality"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>

        <el-table-column prop="notes" label="备注" min-width="220">
          <template slot-scope="scope">
            <span class="notes-text">{{ scope.row.notes || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="editRecord(scope.row)">
              编辑
            </el-button>
            <el-button type="text" size="small" style="color: #f56c6c;" @click="deleteRecord(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="showAddDialog"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="sleepForm" :model="sleepForm" :rules="sleepRules" label-width="120px">
        <el-form-item label="睡眠日期" prop="date">
          <el-date-picker
            v-model="sleepForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="就寝时间" prop="bedtime">
          <el-time-picker
            v-model="sleepForm.bedtime"
            placeholder="选择就寝时间"
            style="width: 100%;"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>

        <el-form-item label="起床时间" prop="wakeup">
          <el-time-picker
            v-model="sleepForm.wakeup"
            placeholder="选择起床时间"
            style="width: 100%;"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>

        <el-form-item label="睡眠质量" prop="quality">
          <el-rate
            v-model="sleepForm.quality"
            :max="5"
            show-text
            :texts="['很差', '较差', '一般', '良好', '很好']"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="sleepForm.notes"
            type="textarea"
            :rows="3"
            placeholder="记录睡眠环境、梦境或其他感受..."
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEditing ? '更新' : '添加' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SleepMonitor',
  data() {
    return {
      showAddDialog: false,
      isEditing: false,
      submitting: false,
      searchText: '',

      // 表单数据
      sleepForm: {
        id: null,
        date: new Date(),
        bedtime: '',
        wakeup: '',
        quality: 3,
        notes: ''
      },

      // 表单验证规则
      sleepRules: {
        date: [
          { required: true, message: '请选择睡眠日期', trigger: 'change' }
        ],
        bedtime: [
          { required: true, message: '请选择就寝时间', trigger: 'change' }
        ],
        wakeup: [
          { required: true, message: '请选择起床时间', trigger: 'change' }
        ],
        quality: [
          { required: true, message: '请评估睡眠质量', trigger: 'change' }
        ]
      },

      // 数据来自 store
      placeholder: null
    }
  },
  computed: {
    ...mapGetters('health', ['sleepRecords', 'sleepLoading']),

    dialogTitle() {
      return this.isEditing ? '编辑睡眠记录' : '添加睡眠记录'
    },

    filteredRecords() {
      let records = this.sleepRecords
      if (this.searchText) {
        records = records.filter(record =>
          (record.notes && record.notes.includes(this.searchText)) ||
          record.date.includes(this.searchText)
        )
      }
      return records
    },

    averageSleep() {
      if (this.sleepRecords.length === 0) return '0.0'
      const total = this.sleepRecords.reduce((sum, record) => sum + record.duration, 0)
      return (total / this.sleepRecords.length).toFixed(1)
    },

    averageQuality() {
      if (this.sleepRecords.length === 0) return '0.0'
      const total = this.sleepRecords.reduce((sum, record) => sum + record.quality, 0)
      return (total / this.sleepRecords.length).toFixed(1)
    },

    averageBedtime() {
      if (this.sleepRecords.length === 0) return '--:--'
      const totalMinutes = this.sleepRecords.reduce((sum, r) => {
        const [h, m] = String(r.bedtime || '00:00').split(':').map(Number)
        return sum + h * 60 + m
      }, 0)
      const avg = Math.round(totalMinutes / this.sleepRecords.length)
      const h = String(Math.floor(avg / 60)).padStart(2, '0')
      const m = String(avg % 60).padStart(2, '0')
      return `${h}:${m}`
    },

    averageWakeup() {
      if (this.sleepRecords.length === 0) return '--:--'
      const totalMinutes = this.sleepRecords.reduce((sum, r) => {
        const [h, m] = String(r.wakeup || '00:00').split(':').map(Number)
        return sum + h * 60 + m
      }, 0)
      const avg = Math.round(totalMinutes / this.sleepRecords.length)
      const h = String(Math.floor(avg / 60)).padStart(2, '0')
      const m = String(avg % 60).padStart(2, '0')
      return `${h}:${m}`
    }
  },

  created() {
    this.loadSleepRecords()
  },

  methods: {
    ...mapActions('health', [
      'fetchSleepRecords',
      'createSleepRecord',
      'updateSleepRecord',
      'removeSleepRecord'
    ]),

    async loadSleepRecords() {
      try {
        await this.fetchSleepRecords()
      } catch (error) {
        this.$message.error('加载睡眠记录失败')
      }
    },

    submitForm() {
      this.$refs.sleepForm.validate(async(valid) => {
        if (valid) {
          this.submitting = true
          try {
            // 计算睡眠时长并写入表单
            const duration = this.calculateDuration(this.sleepForm.bedtime, this.sleepForm.wakeup)
            this.sleepForm.duration = duration

            if (this.isEditing) {
              await this.updateSleepRecord({ id: this.sleepForm.id, data: this.sleepForm })
              this.$message.success('更新成功')
            } else {
              await this.createSleepRecord(this.sleepForm)
              this.$message.success('添加成功')
            }

            this.showAddDialog = false
            this.loadSleepRecords()
          } catch (error) {
            this.$message.error(this.isEditing ? '更新失败' : '添加失败')
          } finally {
            this.submitting = false
          }
        }
      })
    },

    editRecord(record) {
      this.isEditing = true
      this.sleepForm = { ...record }
      this.sleepForm.date = new Date(record.date)
      this.showAddDialog = true
    },

    async deleteRecord(record) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.removeSleepRecord(record.id)
        this.$message.success('删除成功')
        this.loadSleepRecords()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    resetForm() {
      this.isEditing = false
      this.sleepForm = {
        id: null,
        date: new Date(),
        bedtime: '',
        wakeup: '',
        quality: 3,
        notes: ''
      }
      this.$refs.sleepForm && this.$refs.sleepForm.resetFields()
    },

    calculateDuration(bedtime, wakeup) {
      // 简化的时长计算，假设跨天
      const [bedHour, bedMin] = bedtime.split(':').map(Number)
      const [wakeHour, wakeMin] = wakeup.split(':').map(Number)

      const bedMinutes = bedHour * 60 + bedMin
      let wakeMinutes = wakeHour * 60 + wakeMin

      // 如果起床时间小于就寝时间，说明跨天了
      if (wakeMinutes < bedMinutes) {
        wakeMinutes += 24 * 60
      }

      const durationMinutes = wakeMinutes - bedMinutes
      return Math.round((durationMinutes / 60) * 10) / 10
    },

    formatDate(date) {
      if (!date) return ''
      return String(date).slice(0, 10)
    }
  }
}
</script>

<style lang="scss" scoped>
.sleep-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    .stats-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;

      .stats-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        i {
          font-size: 20px;
          color: white;
        }
      }

      .stats-content {
        flex: 1;

        h3 {
          font-size: 14px;
          color: #909399;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .value {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }
      }
    }
  }

  .records-card {
    margin-bottom: 24px;

    .clearfix {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .time-value {
    font-weight: 600;
    color: #409EFF;
  }

  .duration-value {
    font-weight: 600;
    color: #67C23A;
  }

  .notes-text {
    color: #909399;
  }
}

@media (max-width: 768px) {
  .sleep-container {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .stats-cards .stats-card {
      padding: 16px;
    }
  }
}
</style>
