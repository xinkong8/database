<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2 class="dashboard-title">生活概览</h2>
      <p class="dashboard-subtitle">{{ greeting }}，{{ userName }}！今天也要加油哦 💪</p>
    </div>

    <!-- 核心数据面板 -->
    <panel-group @handleSetLineChartData="handleSetLineChartData" @refresh-data="refreshData" />

    <!-- 财务趋势图表 -->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;border-radius:8px;box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <div class="chart-header">
        <h3>财务趋势</h3>
        <div class="chart-tabs">
          <span
            v-for="(label, key) in chartTypes"
            :key="key"
            :class="['chart-tab', { active: currentChart === key }]"
            @click="handleSetLineChartData(key)"
          >
            {{ label }}
          </span>
        </div>
      </div>
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <!-- 数据统计图表 -->
    <el-row :gutter="32" style="margin-bottom:32px;">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="chart-title">生活习惯分析</h3>
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="chart-title">支出分类占比</h3>
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <h3 class="chart-title">目标完成情况</h3>
          <bar-chart />
        </div>
      </el-col>
    </el-row>

    <!-- 详细信息和操作区域 -->
    <el-row :gutter="16">
      <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" style="margin-bottom:30px;">
        <div class="info-card">
          <h3 class="card-title">最近财务记录</h3>
          <transaction-table />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" style="margin-bottom:30px;">
        <div class="info-card">
          <todo-list @refresh-data="refreshData" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" style="margin-bottom:30px;">
        <box-card @refresh-data="refreshData" />
      </el-col>
    </el-row>

    <!-- 生活小贴士 -->
    <el-row style="margin-bottom:30px;">
      <el-col :span="24">
        <div class="tips-card">
          <h3 class="tips-title">💡 今日小贴士</h3>
          <p class="tips-content">{{ dailyTip }}</p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import TodoList from './components/TodoList'
import BoxCard from './components/BoxCard'

const lineChartData = {
  finance: {
    expectedData: [2000, 1800, 2200, 1900, 2100, 2400, 2300],
    actualData: [1800, 1600, 2000, 2100, 1900, 2200, 2100]
  },
  todos: {
    expectedData: [10, 8, 12, 9, 11, 13, 10],
    actualData: [8, 9, 10, 11, 9, 12, 11]
  },
  goals: {
    expectedData: [5, 4, 6, 5, 5, 7, 6],
    actualData: [4, 5, 5, 6, 4, 6, 5]
  },
  health: {
    expectedData: [90, 85, 92, 88, 90, 95, 93],
    actualData: [88, 87, 90, 89, 88, 92, 90]
  }
}

export default {
  name: 'Dashboard',
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    TransactionTable,
    TodoList,
    BoxCard
  },
  data() {
    return {
      lineChartData: lineChartData.finance,
      currentChart: 'finance',
      chartTypes: {
        finance: '财务',
        todos: '任务',
        goals: '目标',
        health: '健康'
      },
      dailyTips: [
        '记账是理财的第一步，坚持记录每一笔支出。',
        '制定小目标更容易实现，积少成多。',
        '保持规律的作息，是健康生活的基础。',
        '每天花10分钟整理待办事项，提高效率。',
        '合理规划预算，让每一分钱都花得有价值。',
        '定期回顾目标进展，及时调整计划。',
        '养成良好的习惯需要21天，坚持就是胜利。'
      ]
    }
  },
  computed: {
    greeting() {
      const hour = new Date().getHours()
      if (hour < 6) return '深夜了'
      if (hour < 9) return '早上好'
      if (hour < 12) return '上午好'
      if (hour < 14) return '中午好'
      if (hour < 17) return '下午好'
      if (hour < 19) return '傍晚好'
      return '晚上好'
    },

    userName() {
      return this.$store.getters.name || '朋友'
    },

    dailyTip() {
      const today = new Date().getDate()
      return this.dailyTips[today % this.dailyTips.length]
    }
  },
  methods: {
    handleSetLineChartData(type) {
      if (lineChartData[type]) {
        this.lineChartData = lineChartData[type]
        this.currentChart = type
      }
    },

    refreshData() {
      // 通知PanelGroup重新加载数据
      this.$nextTick(() => {
        // 触发组件重新渲染数据
        this.$forceUpdate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 50px);

  .dashboard-header {
    text-align: center;
    margin-bottom: 32px;

    .dashboard-title {
      font-size: 32px;
      color: #2c3e50;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .dashboard-subtitle {
      font-size: 16px;
      color: #7f8c8d;
      margin: 0;
    }
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
    }

    .chart-tabs {
      display: flex;
      gap: 8px;

      .chart-tab {
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s;
        border: 1px solid #dcdfe6;
        color: #606266;

        &:hover {
          border-color: #409EFF;
          color: #409EFF;
        }

        &.active {
          background: #409EFF;
          border-color: #409EFF;
          color: white;
        }
      }
    }
  }

  .chart-wrapper {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .chart-title {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 16px;
      text-align: center;
    }
  }

  .info-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    height: 100%;

    .card-title {
      margin: 0;
      padding: 20px 20px 0 20px;
      color: #2c3e50;
      font-size: 16px;
      text-align: center;
    }
  }

  .tips-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 24px;
    border-radius: 8px;
    color: white;
    text-align: center;

    .tips-title {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .tips-content {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

@media (max-width: 1200px) {
  .dashboard-container {
    padding: 16px;
  }

  .chart-header {
    flex-direction: column;
    gap: 12px;

    .chart-tabs {
      justify-content: center;
    }
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    .dashboard-title {
      font-size: 24px;
    }

    .dashboard-subtitle {
      font-size: 14px;
    }
  }

  .chart-wrapper {
    padding: 16px;
  }
}
</style>
