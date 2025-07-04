<template>
  <div class="health-data-panel">
    <h4 class="panel-title">🏥 健康数据</h4>

    <!-- 健康指标快览 -->
    <el-row :gutter="16" class="health-metrics">
      <el-col :span="12">
        <div class="metric-item">
          <div class="metric-icon weight">
            <i class="el-icon-scale" />
          </div>
          <div class="metric-info">
            <span class="metric-label">体重</span>
            <span class="metric-value">{{ currentWeight }} kg</span>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="metric-item">
          <div class="metric-icon exercise">
            <i class="el-icon-bicycle" />
          </div>
          <div class="metric-info">
            <span class="metric-label">本周运动</span>
            <span class="metric-value">{{ weeklyExercise }} 次</span>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="metric-item">
          <div class="metric-icon sleep">
            <i class="el-icon-moon-night" />
          </div>
          <div class="metric-info">
            <span class="metric-label">睡眠质量</span>
            <span class="metric-value">{{ sleepQuality }}/5</span>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="metric-item">
          <div class="metric-icon health">
            <i class="el-icon-monitor" />
          </div>
          <div class="metric-info">
            <span class="metric-label">血压</span>
            <span class="metric-value">{{ bloodPressure }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 健康趋势图表 -->
    <div class="health-chart">
      <h5 class="chart-title">本周健康趋势</h5>
      <div class="chart-container">
        <div id="healthTrendChart" style="width: 100%; height: 200px;" />
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h5 class="actions-title">快速记录</h5>
      <div class="action-buttons">
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-scale"
          @click="goToPage('/health/weight')"
        >
          体重
        </el-button>
        <el-button
          size="mini"
          type="success"
          icon="el-icon-bicycle"
          @click="goToPage('/health/exercise')"
        >
          运动
        </el-button>
        <el-button
          size="mini"
          type="info"
          icon="el-icon-moon-night"
          @click="goToPage('/health/sleep')"
        >
          睡眠
        </el-button>
        <el-button
          size="mini"
          type="warning"
          icon="el-icon-data-line"
          @click="goToPage('/health/metrics')"
        >
          指标
        </el-button>
      </div>
    </div>

    <!-- 健康提醒 -->
    <div class="health-reminders">
      <h5 class="reminders-title">健康提醒</h5>
      <div class="reminder-list">
        <div v-for="reminder in healthReminders" :key="reminder.id" class="reminder-item">
          <i :class="reminder.icon" :style="{ color: reminder.color }" />
          <span class="reminder-text">{{ reminder.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as echarts from 'echarts'

export default {
  name: 'HealthDataPanel',
  data() {
    return {
      chart: null,
      healthReminders: [
        {
          id: 1,
          icon: 'el-icon-warning',
          color: '#E6A23C',
          text: '今天还没有记录体重哦'
        },
        {
          id: 2,
          icon: 'el-icon-success',
          color: '#67C23A',
          text: '睡眠质量不错，继续保持'
        },
        {
          id: 3,
          icon: 'el-icon-info',
          color: '#409EFF',
          text: '建议每天至少运动30分钟'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'latestWeight',
      'weeklyExerciseCount',
      'averageSleepDuration'
    ]),

    currentWeight() {
      return this.latestWeight?.weight || 68.5
    },

    weeklyExercise() {
      return this.weeklyExerciseCount || 3
    },

    sleepQuality() {
      return 4.2
    },

    bloodPressure() {
      return '120/80'
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  },

  methods: {
    initChart() {
      const chartDom = document.getElementById('healthTrendChart')
      if (!chartDom) return

      this.chart = echarts.init(chartDom)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['运动', '睡眠', '健康指数'],
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLabel: {
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 10
          }
        },
        series: [
          {
            name: '运动',
            type: 'bar',
            data: [30, 45, 0, 60, 30, 90, 45],
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '睡眠',
            type: 'line',
            data: [7.5, 6.8, 7.2, 8.0, 7.1, 7.8, 7.5],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '健康指数',
            type: 'line',
            data: [85, 82, 78, 90, 85, 92, 88],
            itemStyle: {
              color: '#E6A23C'
            }
          }
        ]
      }

      this.chart.setOption(option)

      // 响应式
      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize()
        }
      })
    },

    goToPage(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.health-data-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
  }

  .health-metrics {
    margin-bottom: 20px;

    .metric-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 6px;
      background: #f8fafc;
      margin-bottom: 8px;

      .metric-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;

        i {
          font-size: 14px;
          color: white;
        }

        &.weight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.exercise {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.sleep {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.health {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .metric-info {
        flex: 1;

        .metric-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 2px;
        }

        .metric-value {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }

  .health-chart {
    margin-bottom: 20px;

    .chart-title {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      margin: 0 0 10px 0;
    }

    .chart-container {
      border-radius: 6px;
      overflow: hidden;
    }
  }

  .quick-actions {
    margin-bottom: 20px;

    .actions-title {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      margin: 0 0 10px 0;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: 60px;
      }
    }
  }

  .health-reminders {
    .reminders-title {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      margin: 0 0 10px 0;
    }

    .reminder-list {
      .reminder-item {
        display: flex;
        align-items: center;
        padding: 6px 0;
        font-size: 12px;

        i {
          margin-right: 6px;
          font-size: 14px;
        }

        .reminder-text {
          color: #606266;
          line-height: 1.4;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .health-data-panel {
    padding: 16px;

    .health-metrics {
      .metric-item {
        .metric-icon {
          width: 28px;
          height: 28px;

          i {
            font-size: 12px;
          }
        }

        .metric-info {
          .metric-label {
            font-size: 11px;
          }

          .metric-value {
            font-size: 13px;
          }
        }
      }
    }

    .quick-actions .action-buttons {
      .el-button {
        font-size: 12px;
        padding: 5px 8px;
      }
    }
  }
}
</style>
