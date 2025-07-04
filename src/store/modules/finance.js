import {
  getFinanceRecords,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  getFinanceStats,
  getMonthlyTrend,
  getFinanceCategories,
  createFinanceCategory,
  updateFinanceCategory,
  deleteFinanceCategory
} from '@/api/finance'

const state = {
  // 财务记录
  records: [],

  // 财务分类
  categories: [],

  // 统计数据
  stats: {},

  // 月度趋势数据
  monthlyTrend: [],

  // 筛选条件
  filters: {
    type: '',
    category: '',
    dateRange: [],
    minAmount: '',
    maxAmount: ''
  }
}

const mutations = {
  // 设置数据
  SET_RECORDS(state, records) {
    state.records = records
  },

  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },

  SET_STATS(state, stats) {
    state.stats = stats
  },

  SET_MONTHLY_TREND(state, trend) {
    state.monthlyTrend = trend
  },

  // 记录相关
  ADD_RECORD(state, record) {
    state.records.unshift(record)
  },

  UPDATE_RECORD(state, record) {
    const index = state.records.findIndex(r => r.id === record.id)
    if (index !== -1) {
      state.records[index] = record
    }
  },

  DELETE_RECORD(state, id) {
    state.records = state.records.filter(record => record.id !== id)
  },

  // 分类相关
  ADD_CATEGORY(state, category) {
    state.categories.push(category)
  },

  UPDATE_CATEGORY(state, category) {
    const index = state.categories.findIndex(c => c.id === category.id)
    if (index !== -1) {
      state.categories[index] = category
    }
  },

  DELETE_CATEGORY(state, id) {
    state.categories = state.categories.filter(category => category.id !== id)
  },

  // 筛选相关
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },

  RESET_FILTERS(state) {
    state.filters = {
      type: '',
      category: '',
      dateRange: [],
      minAmount: '',
      maxAmount: ''
    }
  }
}

const actions = {
  // 获取数据
  async fetchRecords({ commit }, params) {
    const response = await getFinanceRecords(params)
    if (response.success) {
      commit('SET_RECORDS', response.data)
    }
    return response
  },

  async fetchCategories({ commit }) {
    const response = await getFinanceCategories()
    if (response.success) {
      commit('SET_CATEGORIES', response.data)
    }
    return response
  },

  async fetchStats({ commit }, params) {
    const response = await getFinanceStats(params)
    if (response.success) {
      commit('SET_STATS', response.data)
    }
    return response
  },

  async fetchMonthlyTrend({ commit }, params) {
    const response = await getMonthlyTrend(params)
    if (response.success) {
      commit('SET_MONTHLY_TREND', response.data)
    }
    return response
  },

  // 记录相关
  async addRecord({ commit }, record) {
    const response = await createFinanceRecord(record)
    if (response.success) {
      commit('ADD_RECORD', response.data)
    }
    return response
  },

  async updateRecord({ commit }, { id, data }) {
    const response = await updateFinanceRecord(id, data)
    if (response.success) {
      commit('UPDATE_RECORD', response.data)
    }
    return response
  },

  async deleteRecord({ commit }, id) {
    const response = await deleteFinanceRecord(id)
    if (response.success) {
      commit('DELETE_RECORD', id)
    }
    return response
  },

  // 分类相关
  async addCategory({ commit }, category) {
    const response = await createFinanceCategory(category)
    if (response.success) {
      commit('ADD_CATEGORY', response.data)
    }
    return response
  },

  async updateCategory({ commit }, { id, data }) {
    const response = await updateFinanceCategory(id, data)
    if (response.success) {
      commit('UPDATE_CATEGORY', response.data)
    }
    return response
  },

  async deleteCategory({ commit }, id) {
    const response = await deleteFinanceCategory(id)
    if (response.success) {
      commit('DELETE_CATEGORY', id)
    }
    return response
  },

  // 筛选相关
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },

  resetFilters({ commit }) {
    commit('RESET_FILTERS')
  }
}

const getters = {
  // 筛选后的记录
  filteredRecords: (state) => {
    let records = [...state.records]

    // 类型筛选
    if (state.filters.type) {
      records = records.filter(record => record.type === state.filters.type)
    }

    // 分类筛选
    if (state.filters.category) {
      records = records.filter(record => record.categoryId === state.filters.category)
    }

    // 日期范围筛选
    if (state.filters.dateRange && state.filters.dateRange.length === 2) {
      const startDate = new Date(state.filters.dateRange[0])
      const endDate = new Date(state.filters.dateRange[1])
      records = records.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= startDate && recordDate <= endDate
      })
    }

    // 金额范围筛选
    if (state.filters.minAmount) {
      records = records.filter(record => record.amount >= Number(state.filters.minAmount))
    }

    if (state.filters.maxAmount) {
      records = records.filter(record => record.amount <= Number(state.filters.maxAmount))
    }

    return records
  },

  // 收入记录
  incomeRecords: (state, getters) => {
    return getters.filteredRecords.filter(record => record.type === 'income')
  },

  // 支出记录
  expenseRecords: (state, getters) => {
    return getters.filteredRecords.filter(record => record.type === 'expense')
  },

  // 总收入
  totalIncome: (state, getters) => {
    return getters.incomeRecords.reduce((sum, record) => sum + Number(record.amount), 0)
  },

  // 总支出
  totalExpense: (state, getters) => {
    return getters.expenseRecords.reduce((sum, record) => sum + Number(record.amount), 0)
  },

  // 净结余
  netBalance: (state, getters) => {
    return getters.totalIncome - getters.totalExpense
  },

  // 分类映射
  categoryMap: (state) => {
    const map = {}
    state.categories.forEach(category => {
      map[category.id] = category
    })
    return map
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
