<template>
  <div class="metrics-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">📊 健康指标</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
        添加指标记录
      </el-button>
    </div>

    <!-- 指标卡片 -->
    <el-row :gutter="20" class="metrics-cards">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="metric-card">
          <div class="metric-icon blood-pressure">
            <i class="el-icon-monitor" />
          </div>
          <div class="metric-content">
            <h3>血压</h3>
            <p class="value">{{ latestBloodPressure }}</p>
            <span class="status normal">正常</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="metric-card">
          <div class="metric-icon heart-rate">
            <i class="el-icon-video-camera" />
          </div>
          <div class="metric-content">
            <h3>心率</h3>
            <p class="value">{{ latestHeartRate }} 次/分</p>
            <span class="status normal">正常</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="metric-card">
          <div class="metric-icon blood-sugar">
            <i class="el-icon-grape" />
          </div>
          <div class="metric-content">
            <h3>血糖</h3>
            <p class="value">{{ latestBloodSugar }} mmol/L</p>
            <span class="status normal">正常</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="metric-card">
          <div class="metric-icon temperature">
            <i class="el-icon-thermometer" />
          </div>
          <div class="metric-content">
            <h3>体温</h3>
            <p class="value">{{ latestTemperature }} °C</p>
            <span class="status normal">正常</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 指标记录列表 -->
    <el-card class="records-card">
      <div slot="header" class="clearfix">
        <span>指标记录</span>
        <div style="float: right;">
          <el-select v-model="selectedMetric" placeholder="选择指标类型" style="width: 150px; margin-right: 10px;">
            <el-option label="全部" value="" />
            <el-option label="血压" value="血压" />
            <el-option label="心率" value="心率" />
            <el-option label="血糖" value="血糖" />
            <el-option label="体温" value="体温" />
          </el-select>
          <el-input
            v-model="searchText"
            placeholder="搜索备注..."
            prefix-icon="el-icon-search"
            style="width: 200px;"
            clearable
          />
        </div>
      </div>

      <el-table
        v-loading="metricsLoading"
        :data="filteredRecords"
        style="width: 100%"
      >
        <el-table-column prop="date" label="记录日期" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>

        <el-table-column prop="type" label="指标类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getMetricTypeColor(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="value" label="数值" width="150">
          <template slot-scope="scope">
            <span class="metric-value">{{ formatMetricValue(scope.row) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusColor(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="notes" label="备注" min-width="200">
          <template slot-scope="scope">
            <span class="notes-text">{{ scope.row.notes || '无备注' }}</span>
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
      <el-form ref="metricForm" :model="metricForm" :rules="metricRules" label-width="120px">
        <el-form-item label="记录日期" prop="date">
          <el-date-picker
            v-model="metricForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="指标类型" prop="type">
          <el-select v-model="metricForm.type" placeholder="选择指标类型" style="width: 100%;" @change="onTypeChange">
            <el-option label="血压" value="血压" />
            <el-option label="心率" value="心率" />
            <el-option label="血糖" value="血糖" />
            <el-option label="体温" value="体温" />
          </el-select>
        </el-form-item>

        <!-- 血压专用字段 -->
        <div v-if="metricForm.type === '血压'">
          <el-form-item label="收缩压" prop="systolic">
            <el-input-number
              v-model="metricForm.systolic"
              :min="60"
              :max="250"
              style="width: 100%;"
              placeholder="收缩压 (mmHg)"
            />
          </el-form-item>
          <el-form-item label="舒张压" prop="diastolic">
            <el-input-number
              v-model="metricForm.diastolic"
              :min="40"
              :max="150"
              style="width: 100%;"
              placeholder="舒张压 (mmHg)"
            />
          </el-form-item>
        </div>

        <!-- 其他指标通用字段 -->
        <el-form-item v-else label="数值" prop="value">
          <el-input-number
            v-model="metricForm.value"
            :precision="getValuePrecision()"
            :step="getValueStep()"
            :min="getValueMin()"
            :max="getValueMax()"
            style="width: 100%;"
            :placeholder="getValuePlaceholder()"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="metricForm.notes"
            type="textarea"
            :rows="3"
            placeholder="记录测量环境、身体状况等..."
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
  name: 'HealthMetrics',
  data() {
    return {
      showAddDialog: false,
      isEditing: false,
      submitting: false,
      searchText: '',
      selectedMetric: '',

      // 表单数据
      metricForm: {
        id: null,
        date: new Date(),
        type: '',
        value: null,
        systolic: null, // 收缩压
        diastolic: null, // 舒张压
        notes: ''
      },

      // 表单验证规则
      metricRules: {
        date: [
          { required: true, message: '请选择记录日期', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择指标类型', trigger: 'change' }
        ]
      },

      // 模拟数据
      mockMetricsRecords: [
        {
          id: 1,
          date: '2024-01-15',
          type: '血压',
          systolic: 120,
          diastolic: 80,
          status: '正常',
          notes: '晨起测量'
        },
        {
          id: 2,
          date: '2024-01-15',
          type: '心率',
          value: 72,
          status: '正常',
          notes: '静息心率'
        },
        {
          id: 3,
          date: '2024-01-14',
          type: '血糖',
          value: 5.2,
          status: '正常',
          notes: '餐前血糖'
        },
        {
          id: 4,
          date: '2024-01-14',
          type: '体温',
          value: 36.5,
          status: '正常',
          notes: '腋下测量'
        }
      ]
    }
  },
  computed: {
    ...mapGetters('health', ['healthMetrics', 'metricsLoading']),

    dialogTitle() {
      return this.isEditing ? '编辑健康指标' : '添加健康指标'
    },

    filteredRecords() {
      let records = this.mockMetricsRecords

      if (this.selectedMetric) {
        records = records.filter(record => record.type === this.selectedMetric)
      }

      if (this.searchText) {
        records = records.filter(record =>
          (record.notes && record.notes.includes(this.searchText))
        )
      }

      return records
    },

    latestBloodPressure() {
      const latest = this.mockMetricsRecords.find(record => record.type === '血压')
      return latest ? `${latest.systolic}/${latest.diastolic}` : '--/--'
    },

    latestHeartRate() {
      const latest = this.mockMetricsRecords.find(record => record.type === '心率')
      return latest ? latest.value : '--'
    },

    latestBloodSugar() {
      const latest = this.mockMetricsRecords.find(record => record.type === '血糖')
      return latest ? latest.value : '--'
    },

    latestTemperature() {
      const latest = this.mockMetricsRecords.find(record => record.type === '体温')
      return latest ? latest.value : '--'
    }
  },

  created() {
    this.loadMetricsRecords()
  },

  methods: {
    ...mapActions('health', [
      'fetchHealthMetrics',
      'createHealthMetric',
      'updateHealthMetric',
      'removeHealthMetric'
    ]),

    async loadMetricsRecords() {
      try {
        // await this.fetchHealthMetrics()
      } catch (error) {
        this.$message.error('加载健康指标失败')
      }
    },

    onTypeChange() {
      // 重置相关字段
      this.metricForm.value = null
      this.metricForm.systolic = null
      this.metricForm.diastolic = null
    },

    getValuePrecision() {
      switch (this.metricForm.type) {
        case '血糖': return 1
        case '体温': return 1
        default: return 0
      }
    },

    getValueStep() {
      switch (this.metricForm.type) {
        case '血糖': return 0.1
        case '体温': return 0.1
        default: return 1
      }
    },

    getValueMin() {
      switch (this.metricForm.type) {
        case '心率': return 30
        case '血糖': return 2.0
        case '体温': return 34.0
        default: return 0
      }
    },

    getValueMax() {
      switch (this.metricForm.type) {
        case '心率': return 220
        case '血糖': return 30.0
        case '体温': return 42.0
        default: return 1000
      }
    },

    getValuePlaceholder() {
      switch (this.metricForm.type) {
        case '心率': return '心率 (次/分钟)'
        case '血糖': return '血糖 (mmol/L)'
        case '体温': return '体温 (°C)'
        default: return '请输入数值'
      }
    },

    submitForm() {
      this.$refs.metricForm.validate(async(valid) => {
        if (valid) {
          this.submitting = true
          try {
            if (this.isEditing) {
              // await this.updateHealthMetric({ id: this.metricForm.id, data: this.metricForm })
              this.$message.success('更新成功')
            } else {
              // await this.createHealthMetric(this.metricForm)
              this.$message.success('添加成功')
            }

            this.showAddDialog = false
            this.loadMetricsRecords()
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
      this.metricForm = { ...record }
      this.metricForm.date = new Date(record.date)
      this.showAddDialog = true
    },

    async deleteRecord(record) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // await this.removeHealthMetric(record.id)
        this.$message.success('删除成功')
        this.loadMetricsRecords()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    resetForm() {
      this.isEditing = false
      this.metricForm = {
        id: null,
        date: new Date(),
        type: '',
        value: null,
        systolic: null,
        diastolic: null,
        notes: ''
      }
      this.$refs.metricForm && this.$refs.metricForm.resetFields()
    },

    formatMetricValue(record) {
      if (record.type === '血压') {
        return `${record.systolic}/${record.diastolic} mmHg`
      } else if (record.type === '心率') {
        return `${record.value} 次/分钟`
      } else if (record.type === '血糖') {
        return `${record.value} mmol/L`
      } else if (record.type === '体温') {
        return `${record.value} °C`
      }
      return record.value
    },

    getMetricTypeColor(type) {
      const colors = {
        '血压': 'danger',
        '心率': 'warning',
        '血糖': 'success',
        '体温': 'info'
      }
      return colors[type] || ''
    },

    getStatusColor(status) {
      const colors = {
        '正常': 'success',
        '偏高': 'warning',
        '偏低': 'info',
        '异常': 'danger'
      }
      return colors[status] || ''
    },

    formatDate(date) {
      return date
    }
  }
}
</script>

<style lang="scss" scoped>
.metrics-container {
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

  .metrics-cards {
    margin-bottom: 24px;

    .metric-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;

      .metric-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        i {
          font-size: 20px;
          color: white;
        }

        &.blood-pressure {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.heart-rate {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.blood-sugar {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        &.temperature {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }

      .metric-content {
        flex: 1;

        h3 {
          font-size: 14px;
          color: #909399;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .value {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 4px 0;
        }

        .status {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;

          &.normal {
            background: #f0f9ff;
            color: #67c23a;
          }

          &.warning {
            background: #fdf6ec;
            color: #e6a23c;
          }

          &.danger {
            background: #fef0f0;
            color: #f56c6c;
          }
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

  .metric-value {
    font-weight: 600;
    color: #409EFF;
  }

  .notes-text {
    color: #909399;
  }
}

@media (max-width: 768px) {
  .metrics-container {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .metrics-cards .metric-card {
      padding: 16px;
    }

    .records-card .clearfix {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  }
}
</style>
