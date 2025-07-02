<template>
  <div class="expense-category-chart">
    <div v-if="!hasData" class="no-data">
      <i class="el-icon-pie-chart" />
      <p>本月暂无支出记录</p>
    </div>
    <div v-else class="chart-wrapper">
      <div ref="chart" class="chart-content" />
      <div class="category-legend">
        <div v-for="(item, index) in topCategories" :key="item.name" class="legend-item">
          <span class="legend-color" :style="{ backgroundColor: getColor(index) }" />
          <span class="legend-name">{{ item.name }}</span>
          <span class="legend-value">{{ item.value | money }}</span>
          <span class="legend-percent">{{ getPercent(item.value) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ExpenseCategoryChart',
  filters: {
    money(val) {
      if (typeof val !== 'number' || isNaN(val)) return '¥0.00'
      return val.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null,
      colors: [
        '#667eea', '#f093fb', '#4facfe', '#43e97b',
        '#fa709a', '#ffeaa7', '#fd79a8', '#fdcb6e',
        '#6c5ce7', '#a29bfe', '#74b9ff', '#0984e3'
      ]
    }
  },
  computed: {
    hasData() {
      return this.data && this.data.length > 0 && this.totalAmount > 0
    },
    totalAmount() {
      return this.data.reduce((sum, item) => sum + item.value, 0)
    },
    topCategories() {
      return this.data.slice(0, 8) // 只显示前8个分类
    },
    chartData() {
      return this.topCategories.map((item, index) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: this.getColor(index)
        }
      }))
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
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e6e6e6',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          formatter: (params) => {
            const value = params.value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
            return `${params.name}<br/>金额: ${value}<br/>占比: ${params.percent}%`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: this.chartData
          }
        ]
      }

      this.chart.setOption(option)
    },

    getColor(index) {
      return this.colors[index % this.colors.length]
    },

    getPercent(value) {
      if (this.totalAmount === 0) return 0
      return Math.round((value / this.totalAmount) * 100)
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
.expense-category-chart {
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

  .chart-wrapper {
    display: flex;
    height: 100%;

    .chart-content {
      flex: 1;
      height: 100%;
    }

    .category-legend {
      width: 140px;
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 12px;

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .legend-name {
          flex: 1;
          color: #333;
          font-weight: 500;
        }

        .legend-value {
          color: #666;
          margin-right: 4px;
        }

        .legend-percent {
          color: #999;
          font-size: 11px;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .chart-wrapper {
      flex-direction: column;

      .chart-content {
        height: 200px;
      }

      .category-legend {
        width: 100%;
        padding: 16px 0 0 0;

        .legend-item {
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>
