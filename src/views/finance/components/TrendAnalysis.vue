<template>
  <div class="trend-analysis">
    <!-- 控制栏 -->
    <div class="analysis-controls">
      <div class="left-controls">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="monthly">按月</el-radio-button>
          <el-radio-button label="weekly">按周</el-radio-button>
          <el-radio-button label="daily">按日</el-radio-button>
        </el-radio-group>
      </div>
      <div class="right-controls">
        <el-button size="small" @click="refreshData">
          <i class="el-icon-refresh" />
          刷新
        </el-button>
      </div>
    </div>

    <!-- 趋势图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 收支趋势图 -->
        <el-col :span="24" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>收支趋势分析</h3>
              <div class="chart-legend">
                <span class="legend-item income">
                  <span class="legend-color" />
                  收入
                </span>
                <span class="legend-item expense">
                  <span class="legend-color" />
                  支出
                </span>
                <span class="legend-item net">
                  <span class="legend-color" />
                  净收入
                </span>
              </div>
            </div>
            <div ref="trendChart" class="chart" />
          </div>
        </el-col>

        <!-- 增长率分析图 -->
        <el-col :span="24" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>增长率分析</h3>
              <div class="chart-legend">
                <span class="legend-item income">
                  <span class="legend-color" />
                  收入增长率
                </span>
                <span class="legend-item expense">
                  <span class="legend-color" />
                  支出增长率
                </span>
              </div>
            </div>
            <div ref="growthChart" class="chart" />
          </div>
        </el-col>
      </el-row>

      <!-- 累积趋势图 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <div class="chart-container">
            <div class="chart-header">
              <h3>累积收支趋势</h3>
              <div class="chart-legend">
                <span class="legend-item cumulative-income">
                  <span class="legend-color" />
                  累积收入
                </span>
                <span class="legend-item cumulative-expense">
                  <span class="legend-color" />
                  累积支出
                </span>
                <span class="legend-item cumulative-net">
                  <span class="legend-color" />
                  累积净值
                </span>
              </div>
            </div>
            <div ref="cumulativeChart" class="chart" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详细分析表格 -->
    <div class="analysis-table">
      <div class="table-header">
        <h3>详细趋势分析</h3>
        <el-button size="small" @click="exportTrendData">
          <i class="el-icon-download" />
          导出
        </el-button>
      </div>

      <el-table
        :data="trendTableData"
        border
        stripe
        :header-cell-style="{ background: '#f8f9fa', color: '#2c3e50' }"
      >
        <el-table-column prop="period" label="时间周期" width="120" />
        <el-table-column prop="income" label="收入" width="120">
          <template slot-scope="scope">
            ￥{{ formatAmount(scope.row.income) }}
          </template>
        </el-table-column>
        <el-table-column prop="expense" label="支出" width="120">
          <template slot-scope="scope">
            ￥{{ formatAmount(scope.row.expense) }}
          </template>
        </el-table-column>
        <el-table-column prop="net" label="净收入" width="120">
          <template slot-scope="scope">
            <span :class="scope.row.net >= 0 ? 'text-success' : 'text-danger'">
              ￥{{ formatAmount(scope.row.net) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="incomeGrowth" label="收入增长率" width="120">
          <template slot-scope="scope">
            <span
              v-if="scope.row.incomeGrowth !== null"
              :class="scope.row.incomeGrowth >= 0 ? 'text-success' : 'text-danger'"
            >
              {{ scope.row.incomeGrowth.toFixed(1) }}%
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="expenseGrowth" label="支出增长率" width="120">
          <template slot-scope="scope">
            <span
              v-if="scope.row.expenseGrowth !== null"
              :class="scope.row.expenseGrowth >= 0 ? 'text-danger' : 'text-success'"
            >
              {{ scope.row.expenseGrowth.toFixed(1) }}%
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="savingRate" label="储蓄率" width="100">
          <template slot-scope="scope">
            <span :class="getSavingRateClass(scope.row.savingRate)">
              {{ scope.row.savingRate.toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" label="智能建议" min-width="200">
          <template slot-scope="scope">
            <el-tag
              :type="getSuggestionType(scope.row.suggestion)"
              size="small"
            >
              {{ scope.row.suggestion }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'TrendAnalysis',
  props: {
    dateRange: {
      type: Array,
      default: null
    },
    records: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      viewMode: 'monthly',
      trendChart: null,
      growthChart: null,
      cumulativeChart: null
    }
  },
  computed: {
    processedData() {
      return this.processDataByMode(this.records, this.viewMode)
    },
    trendTableData() {
      return this.processedData.map((item, index) => {
        const prevItem = this.processedData[index - 1]

        return {
          period: item.period,
          income: item.income,
          expense: item.expense,
          net: item.net,
          incomeGrowth: (prevItem && prevItem.income !== 0)
            ? ((item.income - prevItem.income) / prevItem.income * 100)
            : null,
          expenseGrowth: (prevItem && prevItem.expense !== 0)
            ? ((item.expense - prevItem.expense) / prevItem.expense * 100)
            : null,
          savingRate: item.income > 0 ? (item.net / item.income * 100) : 0,
          suggestion: this.generateSuggestion(item, prevItem)
        }
      })
    }
  },
  watch: {
    records: {
      handler() {
        this.$nextTick(() => {
          this.updateAllCharts()
        })
      },
      immediate: true
    },
    viewMode() {
      this.$nextTick(() => {
        this.updateAllCharts()
      })
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.destroyCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initCharts() {
      this.trendChart = echarts.init(this.$refs.trendChart)
      this.growthChart = echarts.init(this.$refs.growthChart)
      this.cumulativeChart = echarts.init(this.$refs.cumulativeChart)
      this.updateAllCharts()
    },
    destroyCharts() {
      if (this.trendChart) {
        this.trendChart.dispose()
      }
      if (this.growthChart) {
        this.growthChart.dispose()
      }
      if (this.cumulativeChart) {
        this.cumulativeChart.dispose()
      }
    },
    handleResize() {
      if (this.trendChart) this.trendChart.resize()
      if (this.growthChart) this.growthChart.resize()
      if (this.cumulativeChart) this.cumulativeChart.resize()
    },
    updateAllCharts() {
      this.updateTrendChart()
      this.updateGrowthChart()
      this.updateCumulativeChart()
    },
    updateTrendChart() {
      if (!this.trendChart) return

      const data = this.processedData
      const periods = data.map(item => item.period)
      const incomes = data.map(item => item.income)
      const expenses = data.map(item => item.expense)
      const nets = data.map(item => item.net)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          formatter: (params) => {
            let result = `${params[0].axisValue}<br/>`
            params.forEach(param => {
              result += `${param.seriesName}: ￥${param.value.toLocaleString()}<br/>`
            })
            return result
          }
        },
        legend: {
          show: false
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '40px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: periods,
          axisLabel: {
            fontSize: 12,
            color: '#666'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `￥${(value / 1000).toFixed(0)}k`,
            fontSize: 12,
            color: '#666'
          }
        },
        series: [
          {
            name: '收入',
            type: 'line',
            data: incomes,
            smooth: true,
            lineStyle: { color: '#67C23A', width: 3 },
            itemStyle: { color: '#67C23A' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
              ])
            }
          },
          {
            name: '支出',
            type: 'line',
            data: expenses,
            smooth: true,
            lineStyle: { color: '#F56C6C', width: 3 },
            itemStyle: { color: '#F56C6C' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
                { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
              ])
            }
          },
          {
            name: '净收入',
            type: 'line',
            data: nets,
            smooth: true,
            lineStyle: { color: '#409EFF', width: 3 },
            itemStyle: { color: '#409EFF' }
          }
        ]
      }

      this.trendChart.setOption(option)
    },
    updateGrowthChart() {
      if (!this.growthChart) return

      const data = this.trendTableData.slice(1) // 跳过第一项（没有增长率）
      const periods = data.map(item => item.period)
      const incomeGrowths = data.map(item => item.incomeGrowth || 0)
      const expenseGrowths = data.map(item => item.expenseGrowth || 0)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          formatter: (params) => {
            let result = `${params[0].axisValue}<br/>`
            params.forEach(param => {
              result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`
            })
            return result
          }
        },
        legend: {
          show: false
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '40px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: periods,
          axisLabel: {
            fontSize: 12,
            color: '#666'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `${value}%`,
            fontSize: 12,
            color: '#666'
          },
          axisLine: {
            lineStyle: { color: '#999' }
          },
          splitLine: {
            lineStyle: { color: '#f0f0f0' }
          }
        },
        series: [
          {
            name: '收入增长率',
            type: 'bar',
            data: incomeGrowths,
            itemStyle: {
              color: (params) => params.value >= 0 ? '#67C23A' : '#F56C6C'
            }
          },
          {
            name: '支出增长率',
            type: 'bar',
            data: expenseGrowths,
            itemStyle: {
              color: (params) => params.value >= 0 ? '#F56C6C' : '#67C23A'
            }
          }
        ]
      }

      this.growthChart.setOption(option)
    },
    updateCumulativeChart() {
      if (!this.cumulativeChart) return

      const data = this.processedData
      let cumulativeIncome = 0
      let cumulativeExpense = 0
      let cumulativeNet = 0

      const periods = []
      const cumulativeIncomes = []
      const cumulativeExpenses = []
      const cumulativeNets = []

      data.forEach(item => {
        cumulativeIncome += item.income
        cumulativeExpense += item.expense
        cumulativeNet += item.net

        periods.push(item.period)
        cumulativeIncomes.push(cumulativeIncome)
        cumulativeExpenses.push(cumulativeExpense)
        cumulativeNets.push(cumulativeNet)
      })

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          formatter: (params) => {
            let result = `${params[0].axisValue}<br/>`
            params.forEach(param => {
              result += `${param.seriesName}: ￥${param.value.toLocaleString()}<br/>`
            })
            return result
          }
        },
        legend: {
          show: false
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '40px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: periods,
          axisLabel: {
            fontSize: 12,
            color: '#666'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `￥${(value / 1000).toFixed(0)}k`,
            fontSize: 12,
            color: '#666'
          }
        },
        series: [
          {
            name: '累积收入',
            type: 'line',
            data: cumulativeIncomes,
            smooth: true,
            lineStyle: { color: '#67C23A', width: 2 },
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '累积支出',
            type: 'line',
            data: cumulativeExpenses,
            smooth: true,
            lineStyle: { color: '#F56C6C', width: 2 },
            itemStyle: { color: '#F56C6C' }
          },
          {
            name: '累积净值',
            type: 'line',
            data: cumulativeNets,
            smooth: true,
            lineStyle: { color: '#409EFF', width: 3 },
            itemStyle: { color: '#409EFF' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.2)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            }
          }
        ]
      }

      this.cumulativeChart.setOption(option)
    },
    processDataByMode(records, mode) {
      const dataMap = new Map()

      records.forEach(record => {
        const date = new Date(record.date)
        let key
        let startOfWeek

        switch (mode) {
          case 'daily':
            key = date.toISOString().split('T')[0]
            break
          case 'weekly':
            startOfWeek = new Date(date)
            startOfWeek.setDate(date.getDate() - date.getDay())
            key = startOfWeek.toISOString().split('T')[0]
            break
          case 'monthly':
          default:
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
        }

        if (!dataMap.has(key)) {
          dataMap.set(key, {
            period: this.formatPeriod(key, mode),
            income: 0,
            expense: 0,
            net: 0
          })
        }

        const item = dataMap.get(key)
        if (record.type === 'income') {
          item.income += record.amount
        } else if (record.type === 'expense') {
          item.expense += record.amount
        }
        item.net = item.income - item.expense
      })

      return Array.from(dataMap.values()).sort((a, b) => a.period.localeCompare(b.period))
    },
    formatPeriod(key, mode) {
      switch (mode) {
        case 'daily':
          return key
        case 'weekly':
          return `${key} 周`
        case 'monthly':
        default:
          return key
      }
    },
    generateSuggestion(current, previous) {
      const savingRate = current.income > 0 ? (current.net / current.income * 100) : 0

      if (savingRate >= 30) {
        return '财务状况优秀'
      } else if (savingRate >= 20) {
        return '储蓄表现良好'
      } else if (savingRate >= 10) {
        return '建议控制支出'
      } else if (savingRate >= 0) {
        return '需要优化预算'
      } else {
        return '超支，需调整'
      }
    },
    getSavingRateClass(rate) {
      if (rate >= 20) return 'text-success'
      if (rate >= 10) return 'text-warning'
      if (rate >= 0) return 'text-info'
      return 'text-danger'
    },
    getSuggestionType(suggestion) {
      if (suggestion.includes('优秀')) return 'success'
      if (suggestion.includes('良好')) return 'success'
      if (suggestion.includes('控制')) return 'warning'
      if (suggestion.includes('优化')) return 'warning'
      return 'danger'
    },
    formatAmount(amount) {
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    exportTrendData() {
      const data = this.trendTableData
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `趋势分析数据_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      this.$message.success('趋势数据导出成功')
    },
    refreshData() {
      this.$emit('refresh')
      this.$nextTick(() => {
        this.updateAllCharts()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.trend-analysis {
  .analysis-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .left-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .right-controls {
      display: flex;
      gap: 8px;
    }
  }

  .charts-section {
    margin-bottom: 32px;

    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          gap: 16px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #666;

            .legend-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;
            }

            &.income .legend-color {
              background: #67C23A;
            }

            &.expense .legend-color {
              background: #F56C6C;
            }

            &.net .legend-color {
              background: #409EFF;
            }

            &.cumulative-income .legend-color {
              background: #67C23A;
            }

            &.cumulative-expense .legend-color {
              background: #F56C6C;
            }

            &.cumulative-net .legend-color {
              background: #409EFF;
            }
          }
        }
      }

      .chart {
        width: 100%;
        height: 300px;
      }
    }
  }

  .analysis-table {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .text-success {
      color: #67C23A;
      font-weight: 500;
    }

    .text-danger {
      color: #F56C6C;
      font-weight: 500;
    }

    .text-warning {
      color: #E6A23C;
      font-weight: 500;
    }

    .text-info {
      color: #909399;
      font-weight: 500;
    }

    .text-muted {
      color: #C0C4CC;
    }
  }
}

@media (max-width: 768px) {
  .trend-analysis {
    .analysis-controls {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .left-controls,
      .right-controls {
        justify-content: center;
      }
    }

    .charts-section {
      .chart-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;

        .chart-legend {
          flex-wrap: wrap;
          gap: 8px;
        }
      }

      .chart {
        height: 250px !important;
      }
    }
  }
}
</style>
