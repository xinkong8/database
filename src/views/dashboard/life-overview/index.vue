<template>
  <div class="life-overview-container">
    <!-- 问候语和日期 -->
    <div class="welcome-section">
      <h1 class="welcome-title">{{ greeting }}，欢迎回来！</h1>
      <p class="current-date">{{ currentDate }}</p>
    </div>

    <!-- 生活数据概览面板 -->
    <life-data-panel @handleSetChartData="handleSetChartData" />

    <!-- 今日进度图表 -->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <div class="chart-title">
        <h3>本周生活数据趋势</h3>
      </div>
      <line-chart :chart-data="chartData" />
    </el-row>

    <!-- 生活统计图表区域（已隐藏） -->
    <el-row v-if="false" :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h4 class="chart-section-title">健康指标</h4>
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h4 class="chart-section-title">支出分类</h4>
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h4 class="chart-section-title">月度对比</h4>
          <bar-chart />
        </div>
      </el-col>
    </el-row>

    <!-- 生活管理区域 -->
    <el-row :gutter="8">
      <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="10" style="padding-right:8px;margin-bottom:30px;">
        <div class="section-wrapper">
          <h4 class="section-title">最近财务记录</h4>
          <recent-transactions />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" style="margin-bottom:30px;">
        <div class="section-wrapper">
          <h4 class="section-title">今日待办</h4>
          <todo-list />
        </div>
      </el-col>
      <el-col v-if="false" :xs="24" :sm="12" :md="6" :lg="4" :xl="4" style="margin-bottom:30px;">
        <div class="section-wrapper">
          <h4 class="section-title">快速操作</h4>
          <quick-actions />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" style="margin-bottom:30px;">
        <health-data-panel />
      </el-col>
    </el-row>

    <!-- 首次使用引导 -->
    <el-dialog :visible.sync="showGuideDialog" title="欢迎使用个人生活管理助手" width="600px" :close-on-click-modal="false">
      <div class="guide-content">
        <p>🎉 欢迎使用个人生活管理助手！</p>
        <p>📋 本系统帮助您管理日常生活的方方面面：</p>
        <ul>
          <li>💰 财务记账和预算管理</li>
          <li>✅ 任务和待办事项管理</li>
          <li>🏃‍♂️ 健康数据追踪</li>
          <li>🎯 目标设定和进度监控</li>
          <li>📊 数据统计和分析</li>
        </ul>
        <p>点击下方按钮开始您的引导之旅！</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showGuideDialog = false">稍后再说</el-button>
        <el-button icon="el-icon-guide" type="primary" @click="guide">开始引导</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import LifeDataPanel from './components/LifeDataPanel'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import RecentTransactions from './components/RecentTransactions'
import TodoList from './components/TodoList'
import QuickActions from './components/QuickActions'
import HealthDataPanel from './components/HealthDataPanel'
import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import steps from '@/views/guide/steps'
import dayjs from 'dayjs'

function getLastSevenDates() {
  const arr = []
  for (let i = 6; i >= 0; i--) {
    arr.push(dayjs().subtract(i, 'day').format('MM-DD'))
  }
  return arr
}

const lifeChartData = {
  tasks: {
    expectedData: [10, 15, 12, 18, 20, 16, 14],
    actualData: [8, 12, 10, 15, 18, 14, 12]
  },
  finance: {
    expectedData: [3000, 3200, 2800, 3500, 3100, 2900, 3300],
    actualData: [2800, 3100, 2900, 3200, 2950, 3050, 3150]
  },
  health: {
    expectedData: [8000, 8500, 9000, 8200, 8800, 9200, 8600],
    actualData: [7500, 8200, 8800, 7900, 8500, 8900, 8300]
  },
  habits: {
    expectedData: [5, 6, 7, 6, 8, 7, 6],
    actualData: [4, 5, 6, 5, 7, 6, 5]
  }
}

export default {
  name: 'LifeOverview',
  components: {
    LifeDataPanel,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    RecentTransactions,
    TodoList,
    QuickActions,
    HealthDataPanel
  },
  data() {
    return {
      chartData: lifeChartData.tasks,
      showGuideDialog: false, // 可以根据需要设置为true
      driver: null
    }
  },
  computed: {
    greeting() {
      const hour = new Date().getHours()
      if (hour < 12) return '早上好'
      if (hour < 18) return '下午好'
      return '晚上好'
    },
    currentDate() {
      const now = new Date()
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
      return now.toLocaleDateString('zh-CN', options)
    }
  },
  mounted() {
    this.driver = new Driver()
    // 先拉取任务数据，再生成默认折线图
    this.$store.dispatch('task/fetchTodos').finally(() => {
      this.chartData = this.generateTaskChartData()
    })
  },
  methods: {
    handleSetChartData(type) {
      switch (type) {
        case 'tasks':
          this.chartData = this.generateTaskChartData()
          break
        default:
          this.chartData = lifeChartData[type]
      }
    },
    generateTaskChartData() {
      const dates = getLastSevenDates()
      const todos = this.$store.getters['task/allTodos'] || []
      const totalPerDay = Array(7).fill(0)
      const completedPerDay = Array(7).fill(0)

      todos.forEach(t => {
        const d = dayjs(t.createdAt || t.date).format('MM-DD')
        const idx = dates.indexOf(d)
        if (idx !== -1) {
          totalPerDay[idx] += 1
          if (t.done) completedPerDay[idx] += 1
        }
      })
      return { expectedData: totalPerDay, actualData: completedPerDay, weeks: dates }
    },
    guide() {
      this.showGuideDialog = false
      this.driver.defineSteps(steps)
      this.driver.start()
    }
  }
}
</script>

<style lang="scss" scoped>
.life-overview-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: calc(100vh - 50px);

  .welcome-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 32px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);

    .welcome-title {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .current-date {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .chart-title {
    margin-bottom: 16px;

    h3 {
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }

  .chart-wrapper {
    background: #fff;
    padding: 20px;
    margin-bottom: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .chart-section-title {
      color: #34495e;
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 16px 0;
      text-align: center;
    }
  }

  .section-wrapper {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 420px;
    .el-table,
    .quick-actions,
    .health-data-panel {
      flex: 1 1 auto;
    }
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .section-title {
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #f1f3f4;
    }
  }

  .guide-content {
    line-height: 1.6;
    color: #5a6c7d;

    p {
      margin-bottom: 16px;
    }

    ul {
      padding-left: 20px;
      margin-bottom: 16px;

      li {
        margin-bottom: 8px;
        color: #34495e;
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}

@media (max-width: 1024px) {
  .life-overview-container {
    padding: 16px;

    .welcome-section {
      padding: 24px;

      .welcome-title {
        font-size: 24px;
      }
    }

    .chart-wrapper, .section-wrapper {
      padding: 16px;
    }
  }
}

@media (max-width: 768px) {
  .life-overview-container {
    .welcome-section {
      padding: 20px;

      .welcome-title {
        font-size: 20px;
      }

      .current-date {
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 600px) {
  .life-overview-container {
    padding: 12px;

    .chart-section {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .chart-wrapper, .section-wrapper {
      padding: 12px !important;
    }

    .welcome-section {
      padding: 16px;

      .welcome-title {
        font-size: 18px;
      }
    }
  }
}
</style>
