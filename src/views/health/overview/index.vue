<template>
  <div class="health-overview-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">🏥 健康概览</h2>
      <p class="page-subtitle">掌握您的健康状况，追踪健康指标</p>
    </div>

    <!-- 健康数据卡片 -->
    <el-row :gutter="20" class="health-cards">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="health-card weight-card">
          <div class="card-icon">
            <i class="el-icon-scale" />
          </div>
          <div class="card-content">
            <h3>当前体重</h3>
            <p class="value">{{ (latestWeight && latestWeight.weight) || '--' }} kg</p>
            <span class="date">{{ (latestWeight && latestWeight.date) || '暂无记录' }}</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="health-card exercise-card">
          <div class="card-icon">
            <i class="el-icon-bicycle" />
          </div>
          <div class="card-content">
            <h3>本周运动</h3>
            <p class="value">{{ weeklyExerciseCount }} 次</p>
            <span class="date">最近7天</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="health-card sleep-card">
          <div class="card-icon">
            <i class="el-icon-moon-night" />
          </div>
          <div class="card-content">
            <h3>平均睡眠</h3>
            <p class="value">{{ averageSleepDuration }} 小时</p>
            <span class="date">近期平均</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="health-card score-card">
          <div class="card-icon">
            <i class="el-icon-data-analysis" />
          </div>
          <div class="card-content">
            <h3>健康评分</h3>
            <p class="value">{{ healthScore }} 分</p>
            <span class="date">综合评估</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <div slot="header" class="clearfix">
            <span>体重趋势</span>
            <el-button-group style="float: right;">
              <el-button size="mini" @click="changePeriod('week')">周</el-button>
              <el-button size="mini" @click="changePeriod('month')">月</el-button>
              <el-button size="mini" @click="changePeriod('quarter')">季</el-button>
            </el-button-group>
          </div>
          <div id="weightTrendChart" style="height:300px;" />
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <div slot="header" class="clearfix">
            <span>运动统计</span>
          </div>
          <div id="exercisePieChart" style="height:300px;" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <div slot="header" class="clearfix">
            <span>睡眠质量</span>
          </div>
          <div id="sleepQualityChart" style="height:300px;" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row class="quick-actions">
      <el-col :span="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>快速记录</span>
          </div>
          <el-button-group>
            <el-button type="primary" icon="el-icon-scale" @click="$router.push('/health/weight')">
              记录体重
            </el-button>
            <el-button type="success" icon="el-icon-bicycle" @click="$router.push('/health/exercise')">
              记录运动
            </el-button>
            <el-button type="info" icon="el-icon-moon-night" @click="$router.push('/health/sleep')">
              记录睡眠
            </el-button>
          </el-button-group>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as echarts from 'echarts'

export default {
  name: 'HealthOverview',
  data() {
    return {
      currentPeriod: 'month'
    }
  },
  computed: {
    ...mapGetters('health', [
      'latestWeight',
      'weeklyExerciseCount',
      'averageSleepDuration'
    ]),
    healthScore() {
      // 根据各项指标计算健康评分
      let score = 60 // 基础分

      // 体重指标（20分）
      if (this.latestWeight) {
        score += 15
      }

      // 运动指标（20分）
      if (this.weeklyExerciseCount >= 3) {
        score += 20
      } else if (this.weeklyExerciseCount >= 1) {
        score += 10
      }

      // 睡眠指标（20分）
      if (this.averageSleepDuration >= 7 && this.averageSleepDuration <= 9) {
        score += 20
      } else if (this.averageSleepDuration >= 6) {
        score += 10
      }

      return Math.min(score, 100)
    }
  },
  created() {
    this.fetchDashboardData()
  },
  mounted() {
    this.fetchDashboardData().then(() => {
      this.initCharts()
      this.$nextTick(() => {
        window.addEventListener('resize', this.resizeCharts)
      })
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    ...mapActions('health', [
      'fetchWeightRecords',
      'fetchExerciseRecords',
      'fetchSleepRecords'
    ]),
    async fetchDashboardData() {
      try {
        await Promise.all([
          this.fetchWeightRecords(),
          this.fetchExerciseRecords(),
          this.fetchSleepRecords()
        ])
        console.log('健康概览数据加载完成')
      } catch (error) {
        console.error('获取健康概览数据失败:', error)
        this.$message.error('获取健康数据失败')
      }
    },
    initCharts() {
      this.drawWeightTrend()
      this.drawExercisePie()
      this.drawSleepQuality()
    },
    resizeCharts() {
      this.weightChart && this.weightChart.resize()
      this.exerciseChart && this.exerciseChart.resize()
      this.sleepChart && this.sleepChart.resize()
    },
    drawWeightTrend() {
      if (!echarts.init) return
      const dom = document.getElementById('weightTrendChart')
      if (!dom) return
      this.weightChart = echarts.init(dom)
      const dates = this.$store.getters['health/weightRecords'].slice().reverse().map(r => String(r.date).split('T')[0].slice(5))
      const weights = this.$store.getters['health/weightRecords'].slice().reverse().map(r => r.weight)
      const option = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value', name: 'kg' },
        series: [
          {
            data: weights,
            type: 'line',
            smooth: true
          }
        ]
      }
      this.weightChart.setOption(option)
    },
    drawExercisePie() {
      if (!echarts.init) return
      const dom = document.getElementById('exercisePieChart')
      if (!dom) return
      this.exerciseChart = echarts.init(dom)
      const exerciseRecords = this.$store.getters['health/exerciseRecords']
      const map = {}
      exerciseRecords.forEach(r => { map[r.type] = (map[r.type] || 0) + 1 })
      const data = Object.keys(map).map(k => ({ name: k, value: map[k] }))
      const pieOption = {
        tooltip: { trigger: 'item' },
        legend: { top: '10%' },
        series: [
          {
            type: 'pie',
            radius: '65%',
            data
          }
        ]
      }
      this.exerciseChart.setOption(pieOption)
    },
    drawSleepQuality() {
      if (!echarts.init) return
      const dom = document.getElementById('sleepQualityChart')
      if (!dom) return
      this.sleepChart = echarts.init(dom)
      const rec = this.$store.getters['health/sleepRecords'].slice().reverse()
      const dates = rec.map(r => String(r.date).split('T')[0].slice(5))
      const quality = rec.map(r => r.quality)
      const sleepOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value', min: 0, max: 5 },
        series: [
          {
            data: quality,
            type: 'bar'
          }
        ]
      }
      this.sleepChart.setOption(sleepOption)
    },
    changePeriod(period) {
      this.currentPeriod = period
      this.$message.success(`已切换到${period === 'week' ? '周' : period === 'month' ? '月' : '季'}视图`)
    }
  }
}
</script>

<style lang="scss" scoped>
.health-overview-container {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      color: #909399;
      margin: 0;
    }
  }

  .health-cards {
    margin-bottom: 24px;

    .health-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;

      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        i {
          font-size: 24px;
          color: white;
        }
      }

      .card-content {
        flex: 1;

        h3 {
          font-size: 14px;
          color: #909399;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 4px 0;
        }

        .date {
          font-size: 12px;
          color: #C0C4CC;
        }
      }

      &.weight-card .card-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.exercise-card .card-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.sleep-card .card-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.score-card .card-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
  }

  .chart-section {
    margin-bottom: 24px;

    .chart-card {
      .el-card__header {
        border-bottom: 1px solid #f0f0f0;

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

      .chart-placeholder {
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #909399;

        p {
          margin: 8px 0;
          font-size: 14px;
        }
      }
    }
  }

  .quick-actions {
    .el-button-group {
      .el-button {
        margin-right: 12px;
      }
    }
  }
}

@media (max-width: 768px) {
  .health-overview-container {
    padding: 16px;

    .health-cards .health-card {
      padding: 16px;

      .card-icon {
        width: 50px;
        height: 50px;
        margin-right: 12px;

        i {
          font-size: 20px;
        }
      }

      .card-content {
        .value {
          font-size: 20px;
        }
      }
    }
  }
}
</style>
