<template>
  <div class="progress-tracking">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">进度追踪</h1>
      <p class="page-subtitle">跟踪您的任务完成进度和统计分析</p>
    </div>

    <!-- 进度概览卡片 -->
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="progress-card total">
          <div class="card-icon">
            <i class="el-icon-list" />
          </div>
          <div class="card-content">
            <div class="card-number">{{ taskStats.total }}</div>
            <div class="card-label">总任务数</div>
            <div class="card-change">
              <span class="change-text">本周 +{{ weeklyStats.added }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="progress-card completed">
          <div class="card-icon">
            <i class="el-icon-check" />
          </div>
          <div class="card-content">
            <div class="card-number">{{ taskStats.completed }}</div>
            <div class="card-label">已完成</div>
            <div class="card-change">
              <span class="change-text">本周 +{{ weeklyStats.completed }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="progress-card rate">
          <div class="card-icon">
            <i class="el-icon-pie-chart" />
          </div>
          <div class="card-content">
            <div class="card-number">{{ taskStats.completionRate }}%</div>
            <div class="card-label">完成率</div>
            <div class="card-change">
              <span :class="['change-text', rateChangeClass]">
                {{ rateChangeText }}
              </span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="progress-card streak">
          <div class="card-icon">
            <i class="el-icon-trophy" />
          </div>
          <div class="card-content">
            <div class="card-number">{{ completionStreak }}</div>
            <div class="card-label">连续完成天数</div>
            <div class="card-change">
              <span class="change-text">继续保持！</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 进度图表区域 -->
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>完成趋势</span>
            <el-radio-group v-model="trendPeriod" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="quarter">本季度</el-radio-button>
            </el-radio-group>
          </div>
          <div class="trend-chart">
            <canvas ref="trendChart" width="400" height="200" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <div slot="header" class="card-header">
            <span>分类分布</span>
          </div>
          <div class="category-chart">
            <div v-for="stat in categoryStats" :key="stat.id" class="category-item">
              <div class="category-info">
                <div class="category-header">
                  <i :class="`el-icon-${stat.icon}`" :style="{ color: stat.color }" />
                  <span class="category-name">{{ stat.name }}</span>
                </div>
                <div class="category-numbers">
                  <span class="completed">{{ stat.completed }}</span>
                  <span class="separator">/</span>
                  <span class="total">{{ stat.total }}</span>
                </div>
              </div>
              <div class="category-progress">
                <el-progress
                  :percentage="stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0"
                  :color="stat.color"
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 项目进度详情 -->
    <el-card class="projects-progress" style="margin-bottom: 24px;">
      <div slot="header" class="card-header">
        <span>项目进度详情</span>
        <el-button type="text" @click="$router.push('/task/project')">查看全部项目</el-button>
      </div>
      <div v-if="projects.length === 0" class="empty-state">
        <i class="el-icon-folder-opened" />
        <p>暂无项目</p>
        <el-button type="primary" @click="$router.push('/task/project')">创建项目</el-button>
      </div>
      <div v-else class="projects-list">
        <div v-for="project in projects" :key="project.id" class="project-progress-item">
          <div class="project-info">
            <div class="project-header">
              <div class="project-color" :style="{ backgroundColor: project.color }" />
              <span class="project-name">{{ project.name }}</span>
              <el-tag :type="getProjectStatusType(project.status)" size="mini">
                {{ getProjectStatusText(project.status) }}
              </el-tag>
            </div>
            <div class="project-stats">
              <span class="stat">
                {{ getProjectTasks(project.id).length }} 个任务
              </span>
              <span class="stat">
                {{ getCompletedProjectTasks(project.id).length }} 已完成
              </span>
              <span class="stat">
                {{ getProjectTasks(project.id).length - getCompletedProjectTasks(project.id).length }} 待完成
              </span>
            </div>
          </div>
          <div class="project-progress-bar">
            <div class="progress-info">
              <span class="progress-percentage">{{ getProjectProgress(project.id) }}%</span>
            </div>
            <el-progress
              :percentage="getProjectProgress(project.id)"
              :color="project.color"
              :stroke-width="8"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 优先级分析 -->
    <el-card class="priority-analysis">
      <div slot="header" class="card-header">
        <span>优先级分析</span>
      </div>
      <el-row :gutter="16">
        <el-col v-for="priority in priorityStats" :key="priority.value" :xs="12" :sm="6">
          <div class="priority-card">
            <div class="priority-header">
              <div class="priority-badge" :style="{ backgroundColor: priority.color }">
                {{ priority.label }}
              </div>
              <span class="priority-count">{{ priority.total }}</span>
            </div>
            <div class="priority-progress">
              <el-progress
                :percentage="priority.total > 0 ? Math.round((priority.completed / priority.total) * 100) : 0"
                :color="priority.color"
                :stroke-width="6"
              />
            </div>
            <div class="priority-details">
              <span class="completed">{{ priority.completed }} 已完成</span>
              <span class="remaining">{{ priority.remaining }} 待完成</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 时间分析对话框 -->
    <el-dialog title="时间分析" :visible.sync="showTimeAnalysis" width="600px">
      <div class="time-analysis">
        <h4>任务完成时间分析</h4>
        <div class="time-stats">
          <div class="time-stat">
            <span class="label">平均完成时间：</span>
            <span class="value">{{ averageCompletionTime }} 天</span>
          </div>
          <div class="time-stat">
            <span class="label">最快完成：</span>
            <span class="value">{{ fastestCompletion }} 小时</span>
          </div>
          <div class="time-stat">
            <span class="label">最慢完成：</span>
            <span class="value">{{ slowestCompletion }} 天</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProgressTracking',
  data() {
    return {
      trendPeriod: 'week',
      showTimeAnalysis: false,
      weeklyStats: {
        added: 3,
        completed: 5
      },
      lastWeekCompletionRate: 65,
      completionStreak: 7,
      averageCompletionTime: 2.5,
      fastestCompletion: 4,
      slowestCompletion: 14
    }
  },
  computed: {
    ...mapGetters([
      'taskStats'
    ]),
    ...mapGetters('task', [
      'allProjects',
      'allTodos',
      'categoryStats',
      'priorityStats',
      'projectProgress'
    ]),
    projects() {
      return this.allProjects
    },
    rateChangeClass() {
      const change = this.taskStats.completionRate - this.lastWeekCompletionRate
      return change >= 0 ? 'positive' : 'negative'
    },
    rateChangeText() {
      const change = this.taskStats.completionRate - this.lastWeekCompletionRate
      const sign = change >= 0 ? '+' : ''
      return `较上周 ${sign}${change}%`
    }
  },
  watch: {
    trendPeriod() {
      this.drawTrendChart()
    }
  },
  mounted() {
    this.drawTrendChart()
  },
  methods: {
    getProjectTasks(projectId) {
      return this.allTodos.filter(todo => todo.project === projectId)
    },
    getCompletedProjectTasks(projectId) {
      return this.allTodos.filter(todo => todo.project === projectId && todo.done)
    },
    getProjectProgress(projectId) {
      return this.projectProgress(projectId)
    },
    getProjectStatusType(status) {
      const statusMap = {
        active: 'success',
        completed: 'info',
        paused: 'warning'
      }
      return statusMap[status] || ''
    },
    getProjectStatusText(status) {
      const statusMap = {
        active: '进行中',
        completed: '已完成',
        paused: '已暂停'
      }
      return statusMap[status] || status
    },
    drawTrendChart() {
      const canvas = this.$refs.trendChart
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height

      // 清空画布
      ctx.clearRect(0, 0, width, height)

      // 模拟数据
      let data = []
      let labels = []

      if (this.trendPeriod === 'week') {
        data = [2, 3, 1, 4, 2, 3, 5]
        labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      } else if (this.trendPeriod === 'month') {
        data = [10, 15, 12, 18, 20, 16, 14, 22, 25, 20, 18, 28, 30, 25, 35]
        labels = Array.from({ length: 15 }, (_, i) => `${i + 1}日`)
      } else {
        data = [45, 52, 48, 61, 58, 55, 49, 67, 71, 65, 59, 73]
        labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      }

      // 绘制简单的折线图
      const padding = 40
      const chartWidth = width - 2 * padding
      const chartHeight = height - 2 * padding

      const maxValue = Math.max(...data)
      const stepX = chartWidth / (data.length - 1)
      const stepY = chartHeight / maxValue

      // 绘制坐标轴
      ctx.strokeStyle = '#E4E7ED'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height - padding)
      ctx.lineTo(width - padding, height - padding)
      ctx.stroke()

      // 绘制数据线
      ctx.strokeStyle = '#409EFF'
      ctx.lineWidth = 2
      ctx.beginPath()

      data.forEach((value, index) => {
        const x = padding + index * stepX
        const y = height - padding - value * stepY

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // 绘制数据点
      ctx.fillStyle = '#409EFF'
      data.forEach((value, index) => {
        const x = padding + index * stepX
        const y = height - padding - value * stepY

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      })

      // 绘制标签
      ctx.fillStyle = '#606266'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'

      labels.forEach((label, index) => {
        const x = padding + index * stepX
        const y = height - 10
        ctx.fillText(label, x, y)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-tracking {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  .page-subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.progress-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  display: flex;
  align-items: center;

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;

    i {
      font-size: 28px;
      color: white;
    }
  }

  .card-content {
    flex: 1;

    .card-number {
      font-size: 32px;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 8px;
    }

    .card-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 4px;
    }

    .card-change {
      .change-text {
        font-size: 12px;

        &.positive {
          color: #67C23A;
        }

        &.negative {
          color: #F56C6C;
        }
      }
    }
  }

  &.total {
    .card-icon {
      background: #409EFF;
    }
    .card-number {
      color: #409EFF;
    }
  }

  &.completed {
    .card-icon {
      background: #67C23A;
    }
    .card-number {
      color: #67C23A;
    }
  }

  &.rate {
    .card-icon {
      background: #E6A23C;
    }
    .card-number {
      color: #E6A23C;
    }
  }

  &.streak {
    .card-icon {
      background: #F56C6C;
    }
    .card-number {
      color: #F56C6C;
    }
  }
}

.chart-card {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
  }

  .trend-chart {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.category-chart {
  .category-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      border-bottom: none;
    }

    .category-info {
      flex: 1;
      margin-right: 16px;

      .category-header {
        display: flex;
        align-items: center;
        margin-bottom: 4px;

        i {
          font-size: 16px;
          margin-right: 8px;
        }

        .category-name {
          font-size: 14px;
          font-weight: 500;
        }
      }

      .category-numbers {
        font-size: 12px;
        color: #909399;

        .completed {
          color: #67C23A;
          font-weight: 500;
        }

        .separator {
          margin: 0 4px;
        }
      }
    }

    .category-progress {
      width: 100px;
    }
  }
}

.projects-progress {
  .projects-list {
    .project-progress-item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      .project-info {
        flex: 1;
        margin-right: 24px;

        .project-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .project-color {
            width: 4px;
            height: 16px;
            border-radius: 2px;
            margin-right: 12px;
          }

          .project-name {
            font-size: 16px;
            font-weight: 500;
            margin-right: 12px;
          }
        }

        .project-stats {
          display: flex;
          gap: 16px;

          .stat {
            font-size: 14px;
            color: #909399;
          }
        }
      }

      .project-progress-bar {
        width: 200px;

        .progress-info {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;

          .progress-percentage {
            font-size: 14px;
            font-weight: 500;
            color: #606266;
          }
        }
      }
    }
  }
}

.priority-analysis {
  .priority-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    .priority-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .priority-badge {
        padding: 4px 8px;
        border-radius: 4px;
        color: white;
        font-size: 12px;
        font-weight: 500;
      }

      .priority-count {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .priority-progress {
      margin-bottom: 12px;
    }

    .priority-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;

      .completed {
        color: #67C23A;
      }

      .remaining {
        color: #909399;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }

  p {
    font-size: 16px;
    margin: 0 0 16px 0;
  }
}

.time-analysis {
  .time-stats {
    .time-stat {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #606266;
      }

      .value {
        font-weight: 500;
        color: #303133;
      }
    }
  }
}

@media (max-width: 768px) {
  .progress-tracking {
    padding: 16px;
  }

  .progress-card {
    flex-direction: column;
    text-align: center;

    .card-icon {
      margin-right: 0;
      margin-bottom: 16px;
    }
  }

  .project-progress-item {
    flex-direction: column;
    align-items: stretch !important;

    .project-info {
      margin-right: 0 !important;
      margin-bottom: 16px;
    }

    .project-progress-bar {
      width: 100% !important;
    }
  }
}
</style>
