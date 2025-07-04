import {
  getWeightRecords,
  addWeightRecord,
  updateWeightRecord,
  deleteWeightRecord,
  getExerciseRecords,
  addExerciseRecord,
  updateExerciseRecord,
  deleteExerciseRecord,
  getExerciseTypes,
  getSleepRecords,
  addSleepRecord,
  updateSleepRecord,
  deleteSleepRecord,
  getHealthMetrics,
  addHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthStatistics,
  getHealthDashboard,
  getHealthTrends
} from '@/api/health'

const state = {
  // 体重记录
  weightRecords: [],
  weightLoading: false,

  // 运动追踪
  exerciseRecords: [],
  exerciseTypes: [],
  exerciseLoading: false,

  // 睡眠监控
  sleepRecords: [],
  sleepLoading: false,

  // 健康指标
  healthMetrics: [],
  metricsLoading: false,

  // 统计数据
  healthStatistics: {},
  dashboardData: {},
  trendsData: {},

  // 通用状态
  loading: false,
  error: null
}

const mutations = {
  // 体重记录相关mutations
  SET_WEIGHT_RECORDS: (state, records) => {
    state.weightRecords = records
  },
  ADD_WEIGHT_RECORD: (state, record) => {
    state.weightRecords.unshift(record)
  },
  UPDATE_WEIGHT_RECORD: (state, updatedRecord) => {
    const index = state.weightRecords.findIndex(record => record.id === updatedRecord.id)
    if (index !== -1) {
      state.weightRecords.splice(index, 1, updatedRecord)
    }
  },
  DELETE_WEIGHT_RECORD: (state, id) => {
    state.weightRecords = state.weightRecords.filter(record => record.id !== id)
  },
  SET_WEIGHT_LOADING: (state, loading) => {
    state.weightLoading = loading
  },

  // 运动追踪相关mutations
  SET_EXERCISE_RECORDS: (state, records) => {
    state.exerciseRecords = records
  },
  ADD_EXERCISE_RECORD: (state, record) => {
    state.exerciseRecords.unshift(record)
  },
  UPDATE_EXERCISE_RECORD: (state, updatedRecord) => {
    const index = state.exerciseRecords.findIndex(record => record.id === updatedRecord.id)
    if (index !== -1) {
      state.exerciseRecords.splice(index, 1, updatedRecord)
    }
  },
  DELETE_EXERCISE_RECORD: (state, id) => {
    state.exerciseRecords = state.exerciseRecords.filter(record => record.id !== id)
  },
  SET_EXERCISE_TYPES: (state, types) => {
    state.exerciseTypes = types
  },
  SET_EXERCISE_LOADING: (state, loading) => {
    state.exerciseLoading = loading
  },

  // 睡眠监控相关mutations
  SET_SLEEP_RECORDS: (state, records) => {
    state.sleepRecords = records
  },
  ADD_SLEEP_RECORD: (state, record) => {
    state.sleepRecords.unshift(record)
  },
  UPDATE_SLEEP_RECORD: (state, updatedRecord) => {
    const index = state.sleepRecords.findIndex(record => record.id === updatedRecord.id)
    if (index !== -1) {
      state.sleepRecords.splice(index, 1, updatedRecord)
    }
  },
  DELETE_SLEEP_RECORD: (state, id) => {
    state.sleepRecords = state.sleepRecords.filter(record => record.id !== id)
  },
  SET_SLEEP_LOADING: (state, loading) => {
    state.sleepLoading = loading
  },

  // 健康指标相关mutations
  SET_HEALTH_METRICS: (state, metrics) => {
    state.healthMetrics = metrics
  },
  ADD_HEALTH_METRIC: (state, metric) => {
    state.healthMetrics.unshift(metric)
  },
  UPDATE_HEALTH_METRIC: (state, updatedMetric) => {
    const index = state.healthMetrics.findIndex(metric => metric.id === updatedMetric.id)
    if (index !== -1) {
      state.healthMetrics.splice(index, 1, updatedMetric)
    }
  },
  DELETE_HEALTH_METRIC: (state, id) => {
    state.healthMetrics = state.healthMetrics.filter(metric => metric.id !== id)
  },
  SET_METRICS_LOADING: (state, loading) => {
    state.metricsLoading = loading
  },

  // 统计数据相关mutations
  SET_HEALTH_STATISTICS: (state, statistics) => {
    state.healthStatistics = statistics
  },
  SET_DASHBOARD_DATA: (state, data) => {
    state.dashboardData = data
  },
  SET_TRENDS_DATA: (state, data) => {
    state.trendsData = data
  },

  // 通用mutations
  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
  SET_ERROR: (state, error) => {
    state.error = error
  }
}

const actions = {
  // 体重记录相关actions
  async fetchWeightRecords({ commit }, params) {
    commit('SET_WEIGHT_LOADING', true)
    try {
      const response = await getWeightRecords(params)
      commit('SET_WEIGHT_RECORDS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_WEIGHT_LOADING', false)
    }
  },

  async createWeightRecord({ commit }, data) {
    try {
      const response = await addWeightRecord(data)
      commit('ADD_WEIGHT_RECORD', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateWeightRecord({ commit }, { id, data }) {
    try {
      const response = await updateWeightRecord(id, data)
      commit('UPDATE_WEIGHT_RECORD', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async removeWeightRecord({ commit }, id) {
    try {
      await deleteWeightRecord(id)
      commit('DELETE_WEIGHT_RECORD', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 运动追踪相关actions
  async fetchExerciseRecords({ commit }, params) {
    commit('SET_EXERCISE_LOADING', true)
    try {
      const response = await getExerciseRecords(params)
      commit('SET_EXERCISE_RECORDS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_EXERCISE_LOADING', false)
    }
  },

  async fetchExerciseTypes({ commit }) {
    try {
      const response = await getExerciseTypes()
      commit('SET_EXERCISE_TYPES', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async createExerciseRecord({ commit }, data) {
    try {
      const response = await addExerciseRecord(data)
      commit('ADD_EXERCISE_RECORD', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateExerciseRecord({ commit }, { id, data }) {
    try {
      const response = await updateExerciseRecord(id, data)
      commit('UPDATE_EXERCISE_RECORD', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async removeExerciseRecord({ commit }, id) {
    try {
      await deleteExerciseRecord(id)
      commit('DELETE_EXERCISE_RECORD', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 睡眠监控相关actions
  async fetchSleepRecords({ commit }, params) {
    commit('SET_SLEEP_LOADING', true)
    try {
      const response = await getSleepRecords(params)
      commit('SET_SLEEP_RECORDS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_SLEEP_LOADING', false)
    }
  },

  async createSleepRecord({ commit }, data) {
    try {
      const response = await addSleepRecord(data)
      commit('ADD_SLEEP_RECORD', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateSleepRecord({ commit }, { id, data }) {
    try {
      const response = await updateSleepRecord(id, data)
      commit('UPDATE_SLEEP_RECORD', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async removeSleepRecord({ commit }, id) {
    try {
      await deleteSleepRecord(id)
      commit('DELETE_SLEEP_RECORD', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 健康指标相关actions
  async fetchHealthMetrics({ commit }, params) {
    commit('SET_METRICS_LOADING', true)
    try {
      const response = await getHealthMetrics(params)
      commit('SET_HEALTH_METRICS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_METRICS_LOADING', false)
    }
  },

  async createHealthMetric({ commit }, data) {
    try {
      const response = await addHealthMetric(data)
      commit('ADD_HEALTH_METRIC', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateHealthMetric({ commit }, { id, data }) {
    try {
      const response = await updateHealthMetric(id, data)
      commit('UPDATE_HEALTH_METRIC', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async removeHealthMetric({ commit }, id) {
    try {
      await deleteHealthMetric(id)
      commit('DELETE_HEALTH_METRIC', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 统计数据相关actions
  async fetchHealthStatistics({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const response = await getHealthStatistics(params)
      commit('SET_HEALTH_STATISTICS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchDashboardData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await getHealthDashboard()
      commit('SET_DASHBOARD_DATA', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchTrendsData({ commit }, { type, period }) {
    commit('SET_LOADING', true)
    try {
      const response = await getHealthTrends(type, period)
      commit('SET_TRENDS_DATA', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  // 最新的体重记录
  latestWeight: state => {
    return state.weightRecords.length > 0 ? state.weightRecords[0] : null
  },

  // 本周运动次数
  weeklyExerciseCount: state => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return state.exerciseRecords.filter(record =>
      new Date(record.date) >= oneWeekAgo
    ).length
  },

  // 平均睡眠时长
  averageSleepDuration: state => {
    if (state.sleepRecords.length === 0) return 0
    const totalHours = state.sleepRecords.reduce((sum, record) => sum + record.duration, 0)
    return Math.round((totalHours / state.sleepRecords.length) * 10) / 10
  },

  // 健康趋势
  healthTrend: state => {
    return state.trendsData || {}
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
