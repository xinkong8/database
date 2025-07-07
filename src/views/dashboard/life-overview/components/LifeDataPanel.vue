<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="goto('/task/overview')" @dblclick.stop="handleSetChartData('tasks')">
        <div class="card-panel-icon-wrapper icon-tasks">
          <svg-icon icon-class="list" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            待办任务
          </div>
          <count-to :start-val="0" :end-val="tasksCount" :duration="1500" class="card-panel-num" />
          <div class="card-panel-unit">项</div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="goto('/finance/overview')" @dblclick.stop="handleSetChartData('finance')">
        <div class="card-panel-icon-wrapper icon-finance">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月支出
          </div>
          <count-to :start-val="0" :end-val="monthExpense" :duration="1500" class="card-panel-num" />
          <div class="card-panel-unit">元</div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="goto('/health/overview')" @dblclick.stop="handleSetChartData('health')">
        <div class="card-panel-icon-wrapper icon-health">
          <svg-icon icon-class="star" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            今日步数
          </div>
          <count-to :start-val="0" :end-val="todaySteps" :duration="1500" class="card-panel-num" />
          <div class="card-panel-unit">步</div>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="goto('/task/habits')" @dblclick.stop="handleSetChartData('habits')">
        <div class="card-panel-icon-wrapper icon-habits">
          <svg-icon icon-class="chart" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            习惯完成
          </div>
          <count-to :start-val="0" :end-val="habitsDone" :duration="1500" class="card-panel-num" />
          <div class="card-panel-unit">/ 7</div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import CountTo from 'vue-count-to'
import { listFinanceRecords } from '@/api/finance'
import dayjs from 'dayjs'

export default {
  name: 'LifeDataPanel',
  components: { CountTo },
  data() {
    return {
      monthExpense: 0,
      todaySteps: 0,
      habitsDone: 0
    }
  },
  computed: {
    ...mapGetters({
      taskStats: 'task/taskStats'
    }),
    tasksCount() {
      // 显示待完成任务数量
      return this.taskStats ? this.taskStats.active : 0
    }
  },
  created() {
    this.loadStats()
  },
  methods: {
    handleSetChartData(type) {
      this.$emit('handleSetChartData', type)
    },
    goto(path) {
      this.$router.push(path)
    },
    async loadStats() {
      // 1. 本月支出
      try {
        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
        const endDate = dayjs().format('YYYY-MM-DD')
        const { records = [] } = await listFinanceRecords({ page: 1, limit: 2000, type: 'expense', startDate: startOfMonth, endDate })
        this.monthExpense = records.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
      } catch (e) {
        /* ignore */
      }

      // 2. 今日步数（示例：将今日运动记录条数 * 1000，当作步数）
      try {
        const today = dayjs().format('YYYY-MM-DD')
        await this.$store.dispatch('health/fetchExerciseRecords', { page: 1, limit: 500, startDate: today, endDate: today })
        const count = this.$store.getters['health/exerciseRecords'].filter(r => dayjs(r.date).format('YYYY-MM-DD') === today).length
        this.todaySteps = count * 1000
      } catch (e) {
        /* ignore */
      }

      // 3. 习惯完成（暂时 0，留待习惯模块接入）
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-tasks {
        background: #1abc9c;
      }

      .icon-finance {
        background: #f39c12;
      }

      .icon-health {
        background: #e74c3c;
      }

      .icon-habits {
        background: #9b59b6;
      }
    }

    .icon-tasks {
      color: #1abc9c;
    }

    .icon-finance {
      color: #f39c12;
    }

    .icon-health {
      color: #e74c3c;
    }

    .icon-habits {
      color: #9b59b6;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
        display: inline-block;
      }

      .card-panel-unit {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        display: inline-block;
        margin-left: 4px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
