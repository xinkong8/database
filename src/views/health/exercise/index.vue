<template>
  <div class="exercise-container">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">🚴 运动追踪</h2>
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">
        添加运动记录
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-bicycle" />
          </div>
          <div class="stats-content">
            <h3>本周运动</h3>
            <p class="value">{{ weeklyCount }} 次</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-time" />
          </div>
          <div class="stats-content">
            <h3>总时长</h3>
            <p class="value">{{ totalDuration }} 分钟</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-lightning" />
          </div>
          <div class="stats-content">
            <h3>消耗卡路里</h3>
            <p class="value">{{ totalCalories }} 千卡</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="el-icon-medal" />
          </div>
          <div class="stats-content">
            <h3>连续天数</h3>
            <p class="value">{{ streakDays }} 天</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 运动记录列表 -->
    <el-card class="records-card">
      <div slot="header" class="clearfix">
        <span>运动记录</span>
        <el-input
          v-model="searchText"
          placeholder="搜索运动类型..."
          prefix-icon="el-icon-search"
          style="width: 200px; float: right;"
          clearable
        />
      </div>

      <el-table
        v-loading="exerciseLoading"
        :data="filteredRecords"
        style="width: 100%"
      >
        <el-table-column prop="date" label="日期" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>

        <el-table-column prop="type" label="运动类型" width="120">
          <template slot-scope="scope">
            <el-tag :color="getExerciseColor(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="时长 (分钟)" width="120">
          <template slot-scope="scope">
            <span class="duration-value">{{ scope.row.duration }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="calories" label="卡路里" width="100">
          <template slot-scope="scope">
            <span class="calories-value">{{ scope.row.calories }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="intensity" label="强度" width="100">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.intensity"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
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
      <el-form ref="exerciseForm" :model="exerciseForm" :rules="exerciseRules" label-width="120px">
        <el-form-item label="运动日期" prop="date">
          <el-date-picker
            v-model="exerciseForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="运动类型" prop="type">
          <el-select v-model="exerciseForm.type" placeholder="选择运动类型" style="width: 100%;">
            <el-option label="跑步" value="跑步" />
            <el-option label="游泳" value="游泳" />
            <el-option label="健身" value="健身" />
            <el-option label="瑜伽" value="瑜伽" />
            <el-option label="骑行" value="骑行" />
            <el-option label="篮球" value="篮球" />
            <el-option label="足球" value="足球" />
            <el-option label="羽毛球" value="羽毛球" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="运动时长" prop="duration">
          <el-input-number
            v-model="exerciseForm.duration"
            :min="1"
            :max="480"
            style="width: 100%;"
            placeholder="请输入运动时长（分钟）"
          />
        </el-form-item>

        <el-form-item label="运动强度" prop="intensity">
          <el-rate
            v-model="exerciseForm.intensity"
            :max="5"
            show-text
            :texts="['很轻松', '轻松', '适中', '费力', '很费力']"
          />
        </el-form-item>

        <el-form-item label="消耗卡路里">
          <el-input-number
            v-model="exerciseForm.calories"
            :min="0"
            style="width: 100%;"
            placeholder="预估消耗的卡路里"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="exerciseForm.notes"
            type="textarea"
            :rows="3"
            placeholder="记录运动感受、场地、天气等..."
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
  name: 'ExerciseTracking',
  data() {
    return {
      showAddDialog: false,
      isEditing: false,
      submitting: false,
      searchText: '',

      // 表单数据
      exerciseForm: {
        id: null,
        date: new Date(),
        type: '',
        duration: null,
        intensity: 3,
        calories: null,
        notes: ''
      },

      // 表单验证规则
      exerciseRules: {
        date: [
          { required: true, message: '请选择运动日期', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择运动类型', trigger: 'change' }
        ],
        duration: [
          { required: true, message: '请输入运动时长', trigger: 'blur' },
          { type: 'number', min: 1, max: 480, message: '运动时长应在1-480分钟之间', trigger: 'blur' }
        ],
        intensity: [
          { required: true, message: '请选择运动强度', trigger: 'change' }
        ]
      },

      // 模拟数据
      mockExerciseRecords: [
        {
          id: 1,
          date: '2024-01-15',
          type: '跑步',
          duration: 30,
          intensity: 4,
          calories: 300,
          notes: '晨跑，天气不错'
        },
        {
          id: 2,
          date: '2024-01-14',
          type: '健身',
          duration: 60,
          intensity: 5,
          calories: 400,
          notes: '力量训练，感觉很棒'
        },
        {
          id: 3,
          date: '2024-01-13',
          type: '瑜伽',
          duration: 45,
          intensity: 2,
          calories: 150,
          notes: '放松身心'
        }
      ]
    }
  },
  computed: {
    ...mapGetters('health', ['exerciseRecords', 'exerciseLoading']),

    dialogTitle() {
      return this.isEditing ? '编辑运动记录' : '添加运动记录'
    },

    filteredRecords() {
      let records = this.mockExerciseRecords
      if (this.searchText) {
        records = records.filter(record =>
          record.type.includes(this.searchText) ||
          (record.notes && record.notes.includes(this.searchText))
        )
      }
      return records
    },

    weeklyCount() {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return this.mockExerciseRecords.filter(record =>
        new Date(record.date) >= oneWeekAgo
      ).length
    },

    totalDuration() {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return this.mockExerciseRecords
        .filter(record => new Date(record.date) >= oneWeekAgo)
        .reduce((sum, record) => sum + record.duration, 0)
    },

    totalCalories() {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return this.mockExerciseRecords
        .filter(record => new Date(record.date) >= oneWeekAgo)
        .reduce((sum, record) => sum + (record.calories || 0), 0)
    },

    streakDays() {
      // 计算连续运动天数
      const sortedRecords = this.mockExerciseRecords
        .map(record => new Date(record.date))
        .sort((a, b) => b - a)

      if (sortedRecords.length === 0) return 0

      let streak = 1
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 1; i < sortedRecords.length; i++) {
        const current = new Date(sortedRecords[i - 1])
        const previous = new Date(sortedRecords[i])
        current.setHours(0, 0, 0, 0)
        previous.setHours(0, 0, 0, 0)

        const diffDays = (current - previous) / (1000 * 60 * 60 * 24)
        if (diffDays === 1) {
          streak++
        } else {
          break
        }
      }

      return streak
    }
  },

  created() {
    this.loadExerciseRecords()
  },

  methods: {
    ...mapActions('health', [
      'fetchExerciseRecords',
      'createExerciseRecord',
      'updateExerciseRecord',
      'removeExerciseRecord'
    ]),

    async loadExerciseRecords() {
      try {
        // await this.fetchExerciseRecords()
      } catch (error) {
        this.$message.error('加载运动记录失败')
      }
    },

    submitForm() {
      this.$refs.exerciseForm.validate(async(valid) => {
        if (valid) {
          this.submitting = true
          try {
            if (this.isEditing) {
              // await this.updateExerciseRecord({ id: this.exerciseForm.id, data: this.exerciseForm })
              this.$message.success('更新成功')
            } else {
              // await this.createExerciseRecord(this.exerciseForm)
              this.$message.success('添加成功')
            }

            this.showAddDialog = false
            this.loadExerciseRecords()
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
      this.exerciseForm = { ...record }
      this.exerciseForm.date = new Date(record.date)
      this.showAddDialog = true
    },

    async deleteRecord(record) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // await this.removeExerciseRecord(record.id)
        this.$message.success('删除成功')
        this.loadExerciseRecords()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    resetForm() {
      this.isEditing = false
      this.exerciseForm = {
        id: null,
        date: new Date(),
        type: '',
        duration: null,
        intensity: 3,
        calories: null,
        notes: ''
      }
      this.$refs.exerciseForm && this.$refs.exerciseForm.resetFields()
    },

    getExerciseColor(type) {
      const colors = {
        '跑步': '#409EFF',
        '游泳': '#67C23A',
        '健身': '#E6A23C',
        '瑜伽': '#F56C6C',
        '骑行': '#909399',
        '篮球': '#FF8C00',
        '足球': '#32CD32',
        '羽毛球': '#FF69B4'
      }
      return colors[type] || '#409EFF'
    },

    formatDate(date) {
      return date
    }
  }
}
</script>

<style lang="scss" scoped>
.exercise-container {
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
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

  .duration-value {
    font-weight: 600;
    color: #409EFF;
  }

  .calories-value {
    font-weight: 600;
    color: #67C23A;
  }

  .notes-text {
    color: #909399;
  }
}

@media (max-width: 768px) {
  .exercise-container {
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
