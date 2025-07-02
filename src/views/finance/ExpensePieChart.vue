<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '@/views/dashboard/life-overview/components/mixins/resize'

export default {
  name: 'ExpensePieChart',
  mixins: [resize],
  props: {
    dataList: {
      type: Array,
      required: true
    },
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    dataList: {
      handler() {
        this.initChart()
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    getPieData() {
      // 按类型统计金额
      const map = {}
      this.dataList.forEach(item => {
        if (!item.type || !item.amount) return
        if (!map[item.type]) map[item.type] = 0
        map[item.type] += Number(item.amount)
      })
      return Object.keys(map).map(type => ({ name: type, value: map[type] }))
    },
    initChart() {
      if (!this.chart) {
        this.chart = echarts.init(this.$el, 'macarons')
      }
      const pieData = this.getPieData()
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: pieData.map(i => i.name)
        },
        series: [
          {
            name: '类型占比',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: pieData,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
