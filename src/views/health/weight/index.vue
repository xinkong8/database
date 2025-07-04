<template>
  <div class="weight-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">⚖️ 体重记录</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
        添加记录
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="8" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-scale" />
          </div>
          <div class="stats-content">
            <h3>当前体重</h3>
            <p class="value">{{ currentWeight }} kg</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="8" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-trend-charts" />
          </div>
          <div class="stats-content">
            <h3>变化趋势</h3>
            <p class="value" :class="weightChangeClass">{{ weightChange }}</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="8" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-aim" />
          </div>
          <div class="stats-content">
            <h3>目标体重</h3>
            <p class="value">{{ targetWeight }} kg</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="8" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-data-analysis" />
          </div>
          <div class="stats-content">
            <h3>BMI指数</h3>
            <p class="value">{{ bmiValue }}</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 体重趋势图表 -->
    <el-card class="chart-card">
      <div slot="header" class="clearfix">
        <span>体重趋势图</span>
        <el-button-group style="float: right;">
          <el-button size="mini" :type="periodType === 'week' ? 'primary' : ''" @click="changePeriod('week')">
            最近一周
          </el-button>
          <el-button size="mini" :type="periodType === 'month' ? 'primary' : ''" @click="changePeriod('month')">
            最近一月
          </el-button>
          <el-button size="mini" :type="periodType === 'quarter' ? 'primary' : ''" @click="changePeriod('quarter')">
            最近三月
          </el-button>
        </el-button-group>
      </div>
      <div class="chart-container">
        <div id="weightChart" style="width: 100%; height: 400px;" />
      </div>
    </el-card>

    <!-- 记录列表 -->
    <el-card class="records-card">
      <div slot="header" class="clearfix">
        <span>记录列表</span>
        <el-input
          v-model="searchText"
          placeholder="搜索记录..."
          prefix-icon="el-icon-search"
          style="width: 200px; float: right;"
          clearable
        />
      </div>

      <el-table
        v-loading="weightLoading"
        :data="filteredRecords"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="date" label="记录日期" width="120" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>

        <el-table-column prop="weight" label="体重 (kg)" width="100" sortable>
          <template slot-scope="scope">
            <span class="weight-value">{{ scope.row.weight }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="bmi" label="BMI" width="80">
          <template slot-scope="scope">
            <el-tag :type="getBmiType(scope.row.bmi)">{{ scope.row.bmi }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="change" label="变化" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.change" :class="getChangeClass(scope.row.change)">
              {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.change }} kg
            </span>
            <span v-else>-</span>
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

      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="showAddDialog"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="weightForm" :model="weightForm" :rules="weightRules" label-width="120px">
        <el-form-item label="记录日期" prop="date">
          <el-date-picker
            v-model="weightForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
            :picker-options="pickerOptions"
          />
        </el-form-item>

        <el-form-item label="体重 (kg)" prop="weight">
          <el-input-number
            v-model="weightForm.weight"
            :precision="1"
            :step="0.1"
            :min="30"
            :max="200"
            style="width: 100%;"
            placeholder="请输入体重"
          />
        </el-form-item>

        <el-form-item label="身高 (cm)" prop="height">
          <el-input-number
            v-model="weightForm.height"
            :precision="0"
            :step="1"
            :min="100"
            :max="220"
            style="width: 100%;"
            placeholder="请输入身高"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="weightForm.notes"
            type="textarea"
            :rows="3"
            placeholder="记录今天的饮食、运动情况或其他备注..."
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
import echarts from 'echarts'

export default {
  name: 'WeightRecord',
  data() {
    return {
      showAddDialog: false,
      isEditing: false,
      submitting: false,
      searchText: '',
      periodType: 'month',

      // 表单数据
      weightForm: {
        id: null,
        date: new Date(),
        weight: null,
        height: 170,
        notes: ''
      },

      // 表单验证规则
      weightRules: {
        date: [
          { required: true, message: '请选择记录日期', trigger: 'change' }
        ],
        weight: [
          { required: true, message: '请输入体重', trigger: 'blur' },
          { type: 'number', min: 30, max: 200, message: '体重应在30-200kg之间', trigger: 'blur' }
        ],
        height: [
          { required: true, message: '请输入身高', trigger: 'blur' },
          { type: 'number', min: 100, max: 220, message: '身高应在100-220cm之间', trigger: 'blur' }
        ]
      },

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },

      // 日期选择器配置
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },

      // 模拟数据
      mockWeightRecords: [
        {
          id: 1,
          date: '2024-01-15',
          weight: 68.5,
          height: 170,
          bmi: 23.7,
          change: -0.3,
          notes: '今天少吃了晚餐，感觉不错'
        },
        {
          id: 2,
          date: '2024-01-14',
          weight: 68.8,
          height: 170,
          bmi: 23.8,
          change: 0.2,
          notes: '昨天聚餐了，体重有点上升'
        },
        {
          id: 3,
          date: '2024-01-13',
          weight: 68.6,
          height: 170,
          bmi: 23.7,
          change: -0.1,
          notes: '跑步30分钟'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['latestWeight']),
    ...mapGetters('health', ['weightRecords', 'weightLoading']),

    dialogTitle() {
      return this.isEditing ? '编辑体重记录' : '添加体重记录'
    },

    filteredRecords() {
      let records = this.mockWeightRecords // 使用模拟数据
      if (this.searchText) {
        records = records.filter(record =>
          (record.notes && record.notes.includes(this.searchText)) ||
          record.date.includes(this.searchText)
        )
      }
      return records
    },

    currentWeight() {
      return this.mockWeightRecords.length > 0 ? this.mockWeightRecords[0].weight : '--'
    },

    weightChange() {
      if (this.mockWeightRecords.length < 2) return '--'
      const current = this.mockWeightRecords[0].weight
      const previous = this.mockWeightRecords[1].weight
      const change = current - previous
      return change > 0 ? `+${change.toFixed(1)}kg` : `${change.toFixed(1)}kg`
    },

    weightChangeClass() {
      if (this.mockWeightRecords.length < 2) return ''
      const current = this.mockWeightRecords[0].weight
      const previous = this.mockWeightRecords[1].weight
      return current > previous ? 'increase' : 'decrease'
    },

    targetWeight() {
      return 65.0 // 可以从设置中获取
    },

    bmiValue() {
      if (this.mockWeightRecords.length === 0) return '--'
      return this.mockWeightRecords[0].bmi
    }
  },

  mounted() {
    this.loadWeightRecords()
    this.initChart()
  },

  methods: {
    ...mapActions('health', [
      'fetchWeightRecords',
      'createWeightRecord',
      'updateWeightRecord',
      'removeWeightRecord'
    ]),

    async loadWeightRecords() {
      try {
        // await this.fetchWeightRecords()
        this.pagination.total = this.mockWeightRecords.length
        this.updateChart()
      } catch (error) {
        this.$message.error('加载体重记录失败')
      }
    },

    initChart() {
      const chartDom = document.getElementById('weightChart')
      this.chart = echarts.init(chartDom)
      this.updateChart()

      // 响应式处理
      window.addEventListener('resize', () => {
        this.chart.resize()
      })
    },

    updateChart() {
      const data = this.mockWeightRecords.slice().reverse()
      const option = {
        title: {
          text: '体重变化趋势',
          left: 'center',
          textStyle: {
            fontSize: 16,
            color: '#303133'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0]
            return `日期: ${data.axisValue}<br/>体重: ${data.value} kg`
          }
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.date),
          axisLabel: {
            formatter: function(value) {
              return value.slice(5) // 只显示月-日
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '体重 (kg)',
          min: function(value) {
            return Math.floor(value.min - 1)
          },
          max: function(value) {
            return Math.ceil(value.max + 1)
          }
        },
        series: [{
          data: data.map(item => item.weight),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#409EFF'
          },
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          }
        }],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      }

      this.chart.setOption(option)
    },

    changePeriod(period) {
      this.periodType = period
      // 根据期间重新加载数据
      this.updateChart()
    },

    submitForm() {
      this.$refs.weightForm.validate(async(valid) => {
        if (valid) {
          this.submitting = true
          try {
            // 计算BMI值
            const bmi = this.calculateBMI(this.weightForm.weight, this.weightForm.height)
            console.log('BMI计算结果:', bmi)

            if (this.isEditing) {
              // await this.updateWeightRecord({ id: this.weightForm.id, data: this.weightForm })
              this.$message.success('更新成功')
            } else {
              // await this.createWeightRecord(this.weightForm)
              this.$message.success('添加成功')
            }

            this.showAddDialog = false
            this.loadWeightRecords()
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
      this.weightForm = { ...record }
      this.weightForm.date = new Date(record.date)
      this.showAddDialog = true
    },

    async deleteRecord(record) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // await this.removeWeightRecord(record.id)
        this.$message.success('删除成功')
        this.loadWeightRecords()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    resetForm() {
      this.isEditing = false
      this.weightForm = {
        id: null,
        date: new Date(),
        weight: null,
        height: 170,
        notes: ''
      }
      this.$refs.weightForm && this.$refs.weightForm.resetFields()
    },

    calculateBMI(weight, height) {
      if (!weight || !height) return 0
      return Math.round((weight / ((height / 100) ** 2)) * 10) / 10
    },

    getBmiType(bmi) {
      if (bmi < 18.5) return 'info'
      if (bmi < 24) return 'success'
      if (bmi < 28) return 'warning'
      return 'danger'
    },

    getChangeClass(change) {
      return change > 0 ? 'increase' : 'decrease'
    },

    formatDate(date) {
      return date
    },

    handleSortChange({ column, prop, order }) {
      // 处理排序
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val
    },

    handleCurrentChange(val) {
      this.pagination.currentPage = val
    }
  }
}
</script>

<style lang="scss" scoped>
.weight-container {
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

          &.increase {
            color: #f56c6c;
          }

          &.decrease {
            color: #67c23a;
          }
        }
      }
    }
  }

  .chart-card, .records-card {
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

  .weight-value {
    font-weight: 600;
    color: #409EFF;
  }

  .notes-text {
    color: #909399;
  }

  .increase {
    color: #f56c6c;
  }

  .decrease {
    color: #67c23a;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}

@media (max-width: 768px) {
  .weight-container {
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
