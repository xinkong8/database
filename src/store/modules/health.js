import {
  getWeightRecords,
  addWeightRecord,
  updateWeightRecord,
  deleteWeightRecord,
  getHealthStats
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
      if (response.success) {
        commit('SET_WEIGHT_RECORDS', response.data)
      }
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
      if (response.success) {
        commit('ADD_WEIGHT_RECORD', response.data)
      }
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async updateWeightRecord({ commit }, { id, data }) {
    try {
      const response = await updateWeightRecord(id, data)
      if (response.success) {
        commit('UPDATE_WEIGHT_RECORD', response.data)
      }
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async removeWeightRecord({ commit }, id) {
    try {
      const response = await deleteWeightRecord(id)
      if (response.success) {
        commit('DELETE_WEIGHT_RECORD', id)
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async fetchHealthStats({ commit }, params) {
    try {
      const response = await getHealthStats(params)
      if (response.success) {
        commit('SET_HEALTH_STATISTICS', response.data)
      }
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }

  // 其他健康功能暂未实现，预留给后续开发
}

const getters = {
  // 最新的体重记录
  latestWeight: state => {
    return state.weightRecords.length > 0 ? state.weightRecords[0] : null
  },

  // BMI计算
  currentBMI: (state, getters) => {
    const latest = getters.latestWeight
    if (!latest || !latest.height) return null
    const heightInM = latest.height / 100
    return Math.round((latest.weight / (heightInM * heightInM)) * 10) / 10
  },

  // 体重趋势
  weightTrend: state => {
    if (state.weightRecords.length < 2) return null
    const latest = state.weightRecords[0]
    const previous = state.weightRecords[1]
    return latest.weight - previous.weight
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
