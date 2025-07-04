<template>
  <div class="monthly-trend-chart">
    <div v-if="!hasData" class="no-data">
      <i class="el-icon-pie-chart" />
      <p>暂无数据</p>
    </div>
    <div v-else ref="chart" class="chart-content" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'MonthlyTrendChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'balance'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    hasData() {
      return this.data && this.data.length > 0
    },
    chartData() {
      if (!this.hasData) return []

      const months = this.data.map(item => {
        const [year, month] = item.month.split('-')
        return `${year}年${month}月`
      })

      const values = this.data.map(item => item[this.type])

      return { months, values }
    }
  },
  watch: {
    data: {
      handler() {
        this.$nextTick(() => {
          this.initChart()
        })
      },
      deep: true
    },
    type() {
      this.initChart()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      if (!this.hasData || !this.$refs.chart) return

      if (this.chart) {
        this.chart.dispose()
      }

      this.chart = echarts.init(this.$refs.chart)

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e6e6e6',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          formatter: (params) => {
            const param = params[0]
            const value = typeof param.value === 'number'
              ? param.value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
              : param.value
            return `${param.name}<br/>${param.seriesName}: ${value}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.chartData.months,
          axisLine: {
            lineStyle: {
              color: '#e6e6e6'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#e6e6e6'
            }
          },
          axisLabel: {
            color: '#666',
            formatter: (value) => {
              if (value >= 10000) {
                return (value / 10000).toFixed(1) + 'w'
              }
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'k'
              }
              return value
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [
          {
            name: this.getSeriesName(),
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: this.getLineColor()
            },
            itemStyle: {
              color: this.getLineColor(),
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: this.getGradientColor() },
                { offset: 1, color: 'rgba(255, 255, 255, 0.1)' }
              ])
            },
            data: this.chartData.values
          }
        ]
      }

      this.chart.setOption(option)
    },

    getSeriesName() {
      const names = {
        income: '收入',
        expense: '支出',
        balance: '结余'
      }
      return names[this.type] || '数据'
    },

    getLineColor() {
      const colors = {
        income: '#27ae60',
        expense: '#e74c3c',
        balance: '#667eea'
      }
      return colors[this.type] || '#667eea'
    },

    getGradientColor() {
      const colors = {
        income: 'rgba(39, 174, 96, 0.3)',
        expense: 'rgba(231, 76, 60, 0.3)',
        balance: 'rgba(102, 126, 234, 0.3)'
      }
      return colors[this.type] || 'rgba(102, 126, 234, 0.3)'
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.monthly-trend-chart {
  width: 100%;
  height: 100%;

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;

    i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .chart-content {
    width: 100%;
    height: 100%;
  }
}
</style>
