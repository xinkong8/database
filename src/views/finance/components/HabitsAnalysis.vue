<template>
  <div class="habits-analysis">
    <!-- 控制栏 -->
    <div class="analysis-controls">
      <div class="left-controls">
        <el-radio-group v-model="analysisType" size="small">
          <el-radio-button label="spending">消费习惯</el-radio-button>
          <el-radio-button label="timing">时间规律</el-radio-button>
          <el-radio-button label="patterns">行为模式</el-radio-button>
        </el-radio-group>
      </div>
      <div class="right-controls">
        <el-button size="small" @click="refreshData">
          <i class="el-icon-refresh" />
          刷新
        </el-button>
      </div>
    </div>

    <!-- 消费习惯分析 -->
    <div v-if="analysisType === 'spending'" class="spending-habits">
      <!-- 消费习惯概览 -->
      <div class="habits-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="habit-card">
              <div class="habit-icon">
                <i class="el-icon-money" />
              </div>
              <div class="habit-content">
                <div class="habit-value">￥{{ formatAmount(spendingHabits.avgDaily) }}</div>
                <div class="habit-label">日均消费</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="habit-card">
              <div class="habit-icon">
                <i class="el-icon-shopping-cart-2" />
              </div>
              <div class="habit-content">
                <div class="habit-value">{{ spendingHabits.frequency }}</div>
                <div class="habit-label">消费频次/天</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="habit-card">
              <div class="habit-icon">
                <i class="el-icon-present" />
              </div>
              <div class="habit-content">
                <div class="habit-value">{{ spendingHabits.topCategory }}</div>
                <div class="habit-label">主要分类</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="habit-card">
              <div class="habit-icon">
                <i class="el-icon-star-on" />
              </div>
              <div class="habit-content">
                <div class="habit-value">{{ spendingHabits.score }}分</div>
                <div class="habit-label">习惯评分</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 消费习惯图表 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :span="24" :lg="12">
            <div class="chart-container">
              <div class="chart-header">
                <h3>每日消费分布</h3>
              </div>
              <div ref="dailySpendingChart" class="chart" />
            </div>
          </el-col>
          <el-col :span="24" :lg="12">
            <div class="chart-container">
              <div class="chart-header">
                <h3>消费金额分布</h3>
              </div>
              <div ref="amountDistributionChart" class="chart" />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 消费习惯分析表 -->
      <div class="habits-table">
        <div class="table-header">
          <h3>消费习惯详细分析</h3>
        </div>
        <el-table :data="spendingHabitsTable" border stripe>
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="avgAmount" label="平均金额" width="120">
            <template slot-scope="scope">
              ￥{{ formatAmount(scope.row.avgAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="frequency" label="消费频次" width="120" />
          <el-table-column prop="preferredTime" label="偏好时间" width="120" />
          <el-table-column prop="trend" label="趋势" width="100">
            <template slot-scope="scope">
              <el-tag :type="getTrendType(scope.row.trend)">
                {{ scope.row.trend }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="suggestion" label="建议" min-width="200" />
        </el-table>
      </div>
    </div>

    <!-- 时间规律分析 -->
    <div v-if="analysisType === 'timing'" class="timing-analysis">
      <!-- 时间分布概览 -->
      <div class="timing-overview">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="timing-card">
              <h4>最活跃时段</h4>
              <div class="timing-value">{{ timingAnalysis.peakHour }}点</div>
              <div class="timing-desc">{{ timingAnalysis.peakDesc }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="timing-card">
              <h4>最活跃日期</h4>
              <div class="timing-value">{{ timingAnalysis.peakDay }}</div>
              <div class="timing-desc">{{ timingAnalysis.dayDesc }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="timing-card">
              <h4>消费规律性</h4>
              <div class="timing-value">{{ timingAnalysis.regularity }}%</div>
              <div class="timing-desc">{{ timingAnalysis.regularityDesc }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 时间分析图表 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :span="24" :lg="12">
            <div class="chart-container">
              <div class="chart-header">
                <h3>小时消费热力图</h3>
              </div>
              <div ref="hourlyHeatmapChart" class="chart" />
            </div>
          </el-col>
          <el-col :span="24" :lg="12">
            <div class="chart-container">
              <div class="chart-header">
                <h3>星期消费模式</h3>
              </div>
              <div ref="weeklyPatternChart" class="chart" />
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <div class="chart-container">
              <div class="chart-header">
                <h3>月内消费分布</h3>
              </div>
              <div ref="monthlyDistributionChart" class="chart" />
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 行为模式分析 -->
    <div v-if="analysisType === 'patterns'" class="patterns-analysis">
      <div class="patterns-summary">
        <h3>行为模式识别</h3>
        <el-alert
          title="行为模式分析功能开发中"
          type="info"
          description="此功能将基于机器学习算法分析您的消费模式，识别异常支出、预测未来趋势等"
          show-icon
          :closable="false"
        />

        <!-- 基础模式分析 -->
        <div class="basic-patterns" style="margin-top: 24px;">
          <h4>基础行为模式</h4>
          <div class="patterns-grid">
            <div class="pattern-item">
              <div class="pattern-icon">
                <i class="el-icon-timer" />
              </div>
              <div class="pattern-content">
                <div class="pattern-title">冲动消费倾向</div>
                <div class="pattern-value">{{ patterns.impulse }}%</div>
                <div class="pattern-desc">单日高额支出占比</div>
              </div>
            </div>

            <div class="pattern-item">
              <div class="pattern-icon">
                <i class="el-icon-sort" />
              </div>
              <div class="pattern-content">
                <div class="pattern-title">消费集中度</div>
                <div class="pattern-value">{{ patterns.concentration }}%</div>
                <div class="pattern-desc">主要分类占总支出比例</div>
              </div>
            </div>

            <div class="pattern-item">
              <div class="pattern-icon">
                <i class="el-icon-data-line" />
              </div>
              <div class="pattern-content">
                <div class="pattern-title">消费稳定性</div>
                <div class="pattern-value">{{ patterns.stability }}%</div>
                <div class="pattern-desc">支出波动幅度评估</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'HabitsAnalysis',
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
      analysisType: 'spending',
      dailySpendingChart: null,
      amountDistributionChart: null,
      hourlyHeatmapChart: null,
      weeklyPatternChart: null,
      monthlyDistributionChart: null
    }
  },
  computed: {
    expenseRecords() {
      return this.records.filter(record => record.type === 'expense')
    },
    spendingHabits() {
      const expenses = this.expenseRecords
      if (expenses.length === 0) {
        return {
          avgDaily: 0,
          frequency: 0,
          topCategory: '无',
          score: 0
        }
      }

      // 计算日均消费
      const totalAmount = expenses.reduce((sum, record) => sum + record.amount, 0)
      const dateRange = this.getDateRange()
      const days = dateRange ? Math.max(1, Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24))) : 1
      const avgDaily = totalAmount / days

      // 计算消费频次
      const frequency = (expenses.length / days).toFixed(1)

      // 获取主要分类
      const categoryMap = new Map()
      expenses.forEach(record => {
        const category = record.category || '其他'
        categoryMap.set(category, (categoryMap.get(category) || 0) + record.amount)
      })
      const topCategory = [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '无'

      // 计算习惯评分（基于规律性和合理性）
      const score = this.calculateHabitScore(expenses, avgDaily, frequency)

      return {
        avgDaily,
        frequency,
        topCategory,
        score
      }
    },
    spendingHabitsTable() {
      const categoryMap = new Map()

      this.expenseRecords.forEach(record => {
        const category = record.category || '其他'
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            amounts: [],
            times: [],
            count: 0
          })
        }
        const item = categoryMap.get(category)
        item.amounts.push(record.amount)
        item.times.push(new Date(record.date).getHours())
        item.count++
      })

      return Array.from(categoryMap.values()).map(item => {
        const avgAmount = item.amounts.reduce((sum, amount) => sum + amount, 0) / item.amounts.length
        const frequency = item.count
        const avgHour = Math.round(item.times.reduce((sum, hour) => sum + hour, 0) / item.times.length)
        const preferredTime = this.formatTimeRange(avgHour)

        return {
          category: item.category,
          avgAmount,
          frequency,
          preferredTime,
          trend: this.calculateTrend(item.amounts),
          suggestion: this.generateSuggestion(item.category, avgAmount, frequency)
        }
      }).sort((a, b) => b.avgAmount - a.avgAmount)
    },
    timingAnalysis() {
      const hourMap = new Map()
      const dayMap = new Map()

      this.expenseRecords.forEach(record => {
        const date = new Date(record.date)
        const hour = date.getHours()
        const day = date.getDay()

        hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
        dayMap.set(day, (dayMap.get(day) || 0) + 1)
      })

      // 找出最活跃时段
      const peakHour = [...hourMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 12
      const peakDay = [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 0

      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

      // 计算规律性
      const regularity = this.calculateRegularity()

      return {
        peakHour,
        peakDesc: this.getTimeDescription(peakHour),
        peakDay: dayNames[peakDay],
        dayDesc: this.getDayDescription(peakDay),
        regularity,
        regularityDesc: this.getRegularityDescription(regularity)
      }
    },
    patterns() {
      const expenses = this.expenseRecords
      if (expenses.length === 0) {
        return { impulse: 0, concentration: 0, stability: 0 }
      }

      // 冲动消费倾向：单日高额支出占比
      const dailyAmounts = this.getDailyAmounts()
      const avgDaily = dailyAmounts.reduce((sum, amount) => sum + amount, 0) / dailyAmounts.length
      const highSpendingDays = dailyAmounts.filter(amount => amount > avgDaily * 2).length
      const impulse = Math.round((highSpendingDays / dailyAmounts.length) * 100)

      // 消费集中度：主要分类占比
      const categoryMap = new Map()
      expenses.forEach(record => {
        const category = record.category || '其他'
        categoryMap.set(category, (categoryMap.get(category) || 0) + record.amount)
      })
      const totalAmount = expenses.reduce((sum, record) => sum + record.amount, 0)
      const maxCategoryAmount = Math.max(...categoryMap.values())
      const concentration = Math.round((maxCategoryAmount / totalAmount) * 100)

      // 消费稳定性：支出标准差
      const amounts = expenses.map(record => record.amount)
      const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
      const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / amounts.length
      const cv = Math.sqrt(variance) / avg
      const stability = Math.round(Math.max(0, (1 - cv) * 100))

      return {
        impulse,
        concentration,
        stability
      }
    }
  },
  watch: {
    records: {
      handler() {
        this.$nextTick(() => {
          this.updateCharts()
        })
      },
      immediate: true
    },
    analysisType() {
      this.$nextTick(() => {
        this.updateCharts()
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
      this.dailySpendingChart = echarts.init(this.$refs.dailySpendingChart)
      this.amountDistributionChart = echarts.init(this.$refs.amountDistributionChart)
      this.hourlyHeatmapChart = echarts.init(this.$refs.hourlyHeatmapChart)
      this.weeklyPatternChart = echarts.init(this.$refs.weeklyPatternChart)
      this.monthlyDistributionChart = echarts.init(this.$refs.monthlyDistributionChart)
      this.updateCharts()
    },
    destroyCharts() {
      if (this.dailySpendingChart) this.dailySpendingChart.dispose()
      if (this.amountDistributionChart) this.amountDistributionChart.dispose()
      if (this.hourlyHeatmapChart) this.hourlyHeatmapChart.dispose()
      if (this.weeklyPatternChart) this.weeklyPatternChart.dispose()
      if (this.monthlyDistributionChart) this.monthlyDistributionChart.dispose()
    },
    handleResize() {
      if (this.dailySpendingChart) this.dailySpendingChart.resize()
      if (this.amountDistributionChart) this.amountDistributionChart.resize()
      if (this.hourlyHeatmapChart) this.hourlyHeatmapChart.resize()
      if (this.weeklyPatternChart) this.weeklyPatternChart.resize()
      if (this.monthlyDistributionChart) this.monthlyDistributionChart.resize()
    },
    updateCharts() {
      if (this.analysisType === 'spending') {
        this.updateDailySpendingChart()
        this.updateAmountDistributionChart()
      } else if (this.analysisType === 'timing') {
        this.updateHourlyHeatmapChart()
        this.updateWeeklyPatternChart()
        this.updateMonthlyDistributionChart()
      }
    },
    updateDailySpendingChart() {
      if (!this.dailySpendingChart) return

      const dailyData = this.getDailySpendingData()

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const param = params[0]
            return `${param.axisValue}<br/>消费金额: ￥${param.value.toLocaleString()}`
          }
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '40px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: dailyData.dates,
          axisLabel: {
            fontSize: 11,
            interval: 'auto'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => `￥${value}`
          }
        },
        series: [
          {
            data: dailyData.amounts,
            type: 'line',
            smooth: true,
            itemStyle: { color: '#409EFF' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            }
          }
        ]
      }

      this.dailySpendingChart.setOption(option)
    },
    updateAmountDistributionChart() {
      if (!this.amountDistributionChart) return

      const ranges = ['0-50', '50-100', '100-200', '200-500', '500-1000', '1000+']
      const distribution = [0, 0, 0, 0, 0, 0]

      this.expenseRecords.forEach(record => {
        const amount = record.amount
        if (amount < 50) distribution[0]++
        else if (amount < 100) distribution[1]++
        else if (amount < 200) distribution[2]++
        else if (amount < 500) distribution[3]++
        else if (amount < 1000) distribution[4]++
        else distribution[5]++
      })

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '60px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: ranges,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: distribution,
            type: 'bar',
            itemStyle: { color: '#67C23A' }
          }
        ]
      }

      this.amountDistributionChart.setOption(option)
    },
    updateHourlyHeatmapChart() {
      if (!this.hourlyHeatmapChart) return

      const hourlyData = this.getHourlyData()

      const option = {
        tooltip: {
          position: 'top',
          formatter: (params) => {
            return `${params.value[0]}点: ${params.value[1]}次消费`
          }
        },
        grid: {
          height: '50%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 24 }, (_, i) => i + '点'),
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: ['消费次数'],
          splitArea: {
            show: true
          }
        },
        series: [
          {
            name: '消费热力',
            type: 'heatmap',
            data: hourlyData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      this.hourlyHeatmapChart.setOption(option)
    },
    updateWeeklyPatternChart() {
      if (!this.weeklyPatternChart) return

      const weekData = this.getWeeklyData()

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '40px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: weekData,
            type: 'bar',
            itemStyle: { color: '#E6A23C' }
          }
        ]
      }

      this.weeklyPatternChart.setOption(option)
    },
    updateMonthlyDistributionChart() {
      if (!this.monthlyDistributionChart) return

      const monthData = this.getMonthlyDistributionData()

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '60px',
          right: '20px',
          bottom: '40px',
          top: '20px'
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 31 }, (_, i) => (i + 1) + '日')
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: monthData,
            type: 'line',
            smooth: true,
            itemStyle: { color: '#F56C6C' }
          }
        ]
      }

      this.monthlyDistributionChart.setOption(option)
    },
    getDailySpendingData() {
      const dailyMap = new Map()

      this.expenseRecords.forEach(record => {
        const date = record.date
        dailyMap.set(date, (dailyMap.get(date) || 0) + record.amount)
      })

      const sortedEntries = [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))

      return {
        dates: sortedEntries.map(entry => entry[0]),
        amounts: sortedEntries.map(entry => entry[1])
      }
    },
    getDailyAmounts() {
      const dailyMap = new Map()

      this.expenseRecords.forEach(record => {
        const date = record.date
        dailyMap.set(date, (dailyMap.get(date) || 0) + record.amount)
      })

      return [...dailyMap.values()]
    },
    getHourlyData() {
      const hourlyCount = new Array(24).fill(0)

      this.expenseRecords.forEach(record => {
        const hour = new Date(record.date).getHours()
        hourlyCount[hour]++
      })

      return hourlyCount.map((count, hour) => [hour, 0, count])
    },
    getWeeklyData() {
      const weeklyCount = new Array(7).fill(0)

      this.expenseRecords.forEach(record => {
        const day = new Date(record.date).getDay()
        weeklyCount[day]++
      })

      return weeklyCount
    },
    getMonthlyDistributionData() {
      const monthlyCount = new Array(31).fill(0)

      this.expenseRecords.forEach(record => {
        const day = new Date(record.date).getDate() - 1
        if (day >= 0 && day < 31) {
          monthlyCount[day]++
        }
      })

      return monthlyCount
    },
    getDateRange() {
      if (this.expenseRecords.length === 0) return null

      const dates = this.expenseRecords.map(record => new Date(record.date))
      return {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates))
      }
    },
    calculateHabitScore(expenses, avgDaily, frequency) {
      // 基于消费规律性、合理性等因素计算评分
      let score = 50 // 基础分

      // 消费频次合理性
      if (frequency >= 0.5 && frequency <= 2) score += 20
      else if (frequency >= 0.2 && frequency <= 3) score += 10

      // 日均消费合理性（假设合理范围是总收入的10-30%）
      if (avgDaily > 0 && avgDaily < 500) score += 20
      else if (avgDaily >= 500 && avgDaily < 1000) score += 10

      // 消费分布均匀性
      const dailyAmounts = this.getDailyAmounts()
      if (dailyAmounts.length > 0) {
        const avg = dailyAmounts.reduce((sum, amount) => sum + amount, 0) / dailyAmounts.length
        const variance = dailyAmounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / dailyAmounts.length
        const cv = Math.sqrt(variance) / avg
        if (cv < 0.5) score += 10
      }

      return Math.min(100, Math.max(0, Math.round(score)))
    },
    calculateTrend(amounts) {
      if (amounts.length < 2) return '稳定'

      const recent = amounts.slice(-Math.ceil(amounts.length / 2))
      const earlier = amounts.slice(0, Math.floor(amounts.length / 2))

      const recentAvg = recent.reduce((sum, amount) => sum + amount, 0) / recent.length
      const earlierAvg = earlier.reduce((sum, amount) => sum + amount, 0) / earlier.length

      const change = (recentAvg - earlierAvg) / earlierAvg

      if (change > 0.1) return '上升'
      if (change < -0.1) return '下降'
      return '稳定'
    },
    calculateRegularity() {
      // 计算消费时间的规律性
      const hours = this.expenseRecords.map(record => new Date(record.date).getHours())
      if (hours.length === 0) return 0

      const hourMap = new Map()
      hours.forEach(hour => {
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
      })

      const maxCount = Math.max(...hourMap.values())
      const regularity = (maxCount / hours.length) * 100

      return Math.round(regularity)
    },
    formatTimeRange(hour) {
      if (hour >= 6 && hour < 12) return '上午'
      if (hour >= 12 && hour < 18) return '下午'
      if (hour >= 18 && hour < 22) return '晚上'
      return '深夜'
    },
    getTimeDescription(hour) {
      if (hour >= 9 && hour < 12) return '工作时间消费较多'
      if (hour >= 12 && hour < 14) return '午餐时间消费集中'
      if (hour >= 18 && hour < 21) return '晚餐娱乐时间'
      return '其他时间段消费'
    },
    getDayDescription(day) {
      if (day === 0 || day === 6) return '周末消费活跃'
      if (day >= 1 && day <= 5) return '工作日消费'
      return '消费分布均匀'
    },
    getRegularityDescription(regularity) {
      if (regularity >= 60) return '消费时间很规律'
      if (regularity >= 40) return '消费时间较规律'
      if (regularity >= 20) return '消费时间一般规律'
      return '消费时间较随意'
    },
    generateSuggestion(category, avgAmount, frequency) {
      if (category === '餐饮' && avgAmount > 100) {
        return '建议控制单次餐饮支出'
      }
      if (category === '购物' && frequency > 10) {
        return '购物频次较高，建议理性消费'
      }
      if (category === '娱乐' && avgAmount > 200) {
        return '娱乐支出偏高，注意预算控制'
      }
      return '消费习惯良好，继续保持'
    },
    getTrendType(trend) {
      if (trend === '上升') return 'danger'
      if (trend === '下降') return 'success'
      return 'info'
    },
    formatAmount(amount) {
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    refreshData() {
      this.$emit('refresh')
      this.$nextTick(() => {
        this.updateCharts()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.habits-analysis {
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

  .spending-habits {
    .habits-overview {
      margin-bottom: 24px;

      .habit-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        height: 100px;

        .habit-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          i {
            font-size: 20px;
            color: white;
          }
        }

        .habit-content {
          flex: 1;

          .habit-value {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
          }

          .habit-label {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }
  }

  .timing-analysis {
    .timing-overview {
      margin-bottom: 24px;

      .timing-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

        h4 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 16px;
        }

        .timing-value {
          font-size: 28px;
          font-weight: 600;
          color: #409EFF;
          margin-bottom: 8px;
        }

        .timing-desc {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }

  .patterns-analysis {
    .patterns-summary {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      h3 {
        margin: 0 0 20px 0;
        color: #2c3e50;
        font-size: 18px;
      }

      h4 {
        margin: 0 0 16px 0;
        color: #2c3e50;
        font-size: 16px;
      }

      .patterns-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;

        .pattern-item {
          display: flex;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;

          .pattern-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16px;

            i {
              font-size: 20px;
              color: white;
            }
          }

          .pattern-content {
            flex: 1;

            .pattern-title {
              font-size: 14px;
              color: #2c3e50;
              margin-bottom: 4px;
            }

            .pattern-value {
              font-size: 20px;
              font-weight: 600;
              color: #409EFF;
              margin-bottom: 4px;
            }

            .pattern-desc {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
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
        margin-bottom: 20px;

        h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .chart {
        width: 100%;
        height: 300px;
      }
    }
  }

  .habits-table {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .table-header {
      margin-bottom: 20px;

      h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

@media (max-width: 768px) {
  .habits-analysis {
    .analysis-controls {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .left-controls {
        justify-content: center;
      }
    }

    .spending-habits .habits-overview .habit-card {
      height: auto;
      margin-bottom: 16px;
    }

    .patterns-analysis .patterns-summary .patterns-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
