<template>
  <div class="category-analysis">
    <!-- 控制栏 -->
    <div class="analysis-controls">
      <div class="left-controls">
        <el-radio-group v-model="analysisType" size="small">
          <el-radio-button label="expense">支出分析</el-radio-button>
          <el-radio-button label="income">收入分析</el-radio-button>
        </el-radio-group>
        <el-select
          v-model="selectedCategories"
          multiple
          placeholder="选择分类查看趋势"
          size="small"
          style="width: 200px;"
        >
          <el-option
            v-for="category in availableCategories"
            :key="category.name"
            :label="category.name"
            :value="category.name"
          />
        </el-select>
      </div>
      <div class="right-controls">
        <el-button size="small" @click="refreshData">
          <i class="el-icon-refresh" />
          刷新
        </el-button>
      </div>
    </div>

    <!-- 分类分布图表 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 饼图 -->
        <el-col :span="24" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>{{ analysisType === 'expense' ? '支出' : '收入' }}分类分布</h3>
              <div class="chart-info">
                总计：￥{{ formatAmount(totalAmount) }}
              </div>
            </div>
            <div ref="pieChart" class="chart" />
          </div>
        </el-col>

        <!-- 柱状图 -->
        <el-col :span="24" :lg="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>分类金额对比</h3>
              <div class="chart-info">
                {{ categoryData.length }} 个分类
              </div>
            </div>
            <div ref="barChart" class="chart" />
          </div>
        </el-col>
      </el-row>

      <!-- 分类趋势图 -->
      <el-row v-if="selectedCategories.length > 0" :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <div class="chart-container">
            <div class="chart-header">
              <h3>选定分类趋势</h3>
              <div class="chart-info">
                已选择 {{ selectedCategories.length }} 个分类
              </div>
            </div>
            <div ref="trendChart" class="chart" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 分类排行榜和进度条 -->
    <div class="ranking-section">
      <el-row :gutter="20">
        <!-- 排行榜 -->
        <el-col :span="24" :lg="14">
          <div class="ranking-container">
            <div class="ranking-header">
              <h3>{{ analysisType === 'expense' ? '支出' : '收入' }}分类排行榜</h3>
              <el-button size="small" @click="exportRankingData">
                <i class="el-icon-download" />
                导出
              </el-button>
            </div>

            <div class="ranking-list">
              <div
                v-for="(item, index) in categoryData"
                :key="item.name"
                class="ranking-item"
                :class="{ 'top-3': index < 3 }"
              >
                <div class="rank">
                  <span class="rank-number" :class="`rank-${index + 1}`">
                    {{ index + 1 }}
                  </span>
                </div>
                <div class="category-info">
                  <div class="category-name">{{ item.name }}</div>
                  <div class="category-details">
                    <span class="amount">￥{{ formatAmount(item.amount) }}</span>
                    <span class="percentage">{{ item.percentage }}%</span>
                    <span class="count">{{ item.count }}笔</span>
                  </div>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{
                      width: item.percentage + '%',
                      backgroundColor: item.color
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 统计概览 -->
        <el-col :span="24" :lg="10">
          <div class="stats-container">
            <div class="stats-header">
              <h3>统计概览</h3>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ categoryData.length }}</div>
                <div class="stat-label">分类数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">￥{{ formatAmount(averageAmount) }}</div>
                <div class="stat-label">平均金额</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ totalRecords }}</div>
                <div class="stat-label">记录总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ maxCategory.name }}</div>
                <div class="stat-label">最大分类</div>
              </div>
            </div>

            <!-- Top 3 分类详细信息 -->
            <div class="top-categories">
              <h4>Top 3 分类</h4>
              <div class="top-list">
                <div
                  v-for="(item, index) in categoryData.slice(0, 3)"
                  :key="item.name"
                  class="top-item"
                >
                  <div class="top-icon" :style="{ backgroundColor: item.color }">
                    {{ index + 1 }}
                  </div>
                  <div class="top-info">
                    <div class="top-name">{{ item.name }}</div>
                    <div class="top-amount">￥{{ formatAmount(item.amount) }}</div>
                  </div>
                  <div class="top-percentage">{{ item.percentage }}%</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'CategoryAnalysis',
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
      analysisType: 'expense',
      selectedCategories: [],
      pieChart: null,
      barChart: null,
      trendChart: null,
      colors: [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#f59e9e',
        '#87c3f0', '#a2d5ab', '#f7d060', '#f5a281', '#d4a5d4'
      ]
    }
  },
  computed: {
    filteredRecords() {
      return this.records.filter(record => record.type === this.analysisType)
    },
    categoryData() {
      const categoryMap = new Map()

      this.filteredRecords.forEach(record => {
        const category = record.category || '其他'
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: category,
            amount: 0,
            count: 0
          })
        }
        const item = categoryMap.get(category)
        item.amount += record.amount
        item.count += 1
      })

      const data = Array.from(categoryMap.values())
      const total = data.reduce((sum, item) => sum + item.amount, 0)

      return data
        .map((item, index) => ({
          ...item,
          percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0,
          color: this.colors[index % this.colors.length]
        }))
        .sort((a, b) => b.amount - a.amount)
    },
    availableCategories() {
      return this.categoryData.map(item => ({
        name: item.name,
        amount: item.amount
      }))
    },
    totalAmount() {
      return this.categoryData.reduce((sum, item) => sum + item.amount, 0)
    },
    averageAmount() {
      return this.categoryData.length > 0 ? this.totalAmount / this.categoryData.length : 0
    },
    totalRecords() {
      return this.categoryData.reduce((sum, item) => sum + item.count, 0)
    },
    maxCategory() {
      return this.categoryData.length > 0 ? this.categoryData[0] : { name: '无' }
    },
    trendData() {
      if (this.selectedCategories.length === 0) return []

      // 按月分组计算趋势
      const monthMap = new Map()

      this.filteredRecords.forEach(record => {
        if (!this.selectedCategories.includes(record.category)) return

        const date = new Date(record.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, {})
        }

        const monthData = monthMap.get(monthKey)
        if (!monthData[record.category]) {
          monthData[record.category] = 0
        }
        monthData[record.category] += record.amount
      })

      return Array.from(monthMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
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
    analysisType() {
      this.selectedCategories = []
      this.$nextTick(() => {
        this.updateAllCharts()
      })
    },
    selectedCategories() {
      this.$nextTick(() => {
        this.updateTrendChart()
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
      this.pieChart = echarts.init(this.$refs.pieChart)
      this.barChart = echarts.init(this.$refs.barChart)
      this.trendChart = echarts.init(this.$refs.trendChart)
      this.updateAllCharts()
    },
    destroyCharts() {
      if (this.pieChart) this.pieChart.dispose()
      if (this.barChart) this.barChart.dispose()
      if (this.trendChart) this.trendChart.dispose()
    },
    handleResize() {
      if (this.pieChart) this.pieChart.resize()
      if (this.barChart) this.barChart.resize()
      if (this.trendChart) this.trendChart.resize()
    },
    updateAllCharts() {
      this.updatePieChart()
      this.updateBarChart()
      this.updateTrendChart()
    },
    updatePieChart() {
      if (!this.pieChart) return

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: ￥{c} ({d}%)'
        },
        series: [
          {
            name: this.analysisType === 'expense' ? '支出分类' : '收入分类',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.categoryData.map(item => ({
              value: item.amount,
              name: item.name,
              itemStyle: { color: item.color }
            }))
          }
        ]
      }

      this.pieChart.setOption(option)
    },
    updateBarChart() {
      if (!this.barChart) return

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const param = params[0]
            return `${param.name}<br/>金额: ￥${param.value.toLocaleString()}`
          }
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '60px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: this.categoryData.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 45,
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `￥${(value / 1000).toFixed(0)}k`
          }
        },
        series: [
          {
            data: this.categoryData.map(item => ({
              value: item.amount,
              itemStyle: { color: item.color }
            })),
            type: 'bar',
            barWidth: '60%'
          }
        ]
      }

      this.barChart.setOption(option)
    },
    updateTrendChart() {
      if (!this.trendChart || this.selectedCategories.length === 0) {
        if (this.trendChart) {
          this.trendChart.clear()
        }
        return
      }

      const months = this.trendData.map(item => item.month)
      const series = this.selectedCategories.map((category, index) => ({
        name: category,
        type: 'line',
        data: this.trendData.map(item => item[category] || 0),
        smooth: true,
        lineStyle: { width: 3 },
        itemStyle: { color: this.colors[index % this.colors.length] }
      }))

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: this.selectedCategories,
          bottom: 0
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '60px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `￥${(value / 1000).toFixed(0)}k`
          }
        },
        series
      }

      this.trendChart.setOption(option)
    },
    exportRankingData() {
      const data = this.categoryData.map(item => ({
        排名: this.categoryData.indexOf(item) + 1,
        分类: item.name,
        金额: item.amount,
        占比: item.percentage + '%',
        记录数: item.count
      }))

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `分类排行榜_${this.analysisType}_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      this.$message.success('排行榜数据导出成功')
    },
    formatAmount(amount) {
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
.category-analysis {
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

        .chart-info {
          font-size: 12px;
          color: #666;
          padding: 4px 8px;
          background: #f0f2f5;
          border-radius: 4px;
        }
      }

      .chart {
        width: 100%;
        height: 300px;
      }
    }
  }

  .ranking-section {
    .ranking-container,
    .stats-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      height: 100%;
    }

    .ranking-header,
    .stats-header {
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

    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f2f5;

        &.top-3 .rank .rank-number {
          font-weight: bold;
        }

        .rank {
          width: 40px;
          display: flex;
          justify-content: center;

          .rank-number {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;

            &.rank-1 { background: #ff6b6b; }
            &.rank-2 { background: #4ecdc4; }
            &.rank-3 { background: #45b7d1; }
            &:not(.rank-1):not(.rank-2):not(.rank-3) {
              background: #95a5a6;
            }
          }
        }

        .category-info {
          flex: 1;
          margin-left: 12px;

          .category-name {
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 4px;
          }

          .category-details {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #666;

            .amount {
              font-weight: 500;
              color: #2c3e50;
            }

            .percentage {
              color: #67C23A;
            }
          }
        }

        .progress-bar {
          width: 80px;
          height: 6px;
          background: #f0f2f5;
          border-radius: 3px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
          }
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      .stat-item {
        text-align: center;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }
      }
    }

    .top-categories {
      h4 {
        margin: 0 0 16px 0;
        color: #2c3e50;
        font-size: 14px;
      }

      .top-list {
        .top-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f2f5;

          &:last-child {
            border-bottom: none;
          }

          .top-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          }

          .top-info {
            flex: 1;
            margin-left: 12px;

            .top-name {
              font-size: 13px;
              color: #2c3e50;
            }

            .top-amount {
              font-size: 11px;
              color: #666;
            }
          }

          .top-percentage {
            font-size: 12px;
            color: #67C23A;
            font-weight: 500;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .category-analysis {
    .analysis-controls {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .left-controls {
        flex-direction: column;
        gap: 8px;
      }
    }

    .ranking-section {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
