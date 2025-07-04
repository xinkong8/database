import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: true, // 强制侧边栏始终打开
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',

  // 全局加载状态
  loading: false,
  loadingMessage: '加载中...',

  // 全局错误状态
  error: null,

  // 网络连接状态
  online: true
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    // 注释掉切换功能，保持侧边栏始终打开
    // state.sidebar.opened = !state.sidebar.opened
    state.sidebar.opened = true // 强制保持打开
    state.sidebar.withoutAnimation = false
    Cookies.set('sidebarStatus', 1)
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    // 强制保持侧边栏打开，不允许关闭
    Cookies.set('sidebarStatus', 1)
    state.sidebar.opened = true
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },

  // 全局状态管理
  SET_LOADING: (state, { loading, message }) => {
    state.loading = loading
    if (message !== undefined) {
      state.loadingMessage = message
    }
  },

  SET_ERROR: (state, error) => {
    state.error = error
  },

  CLEAR_ERROR: (state) => {
    state.error = null
  },

  SET_ONLINE: (state, online) => {
    state.online = online
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },

  // 全局状态管理
  setLoading({ commit }, payload) {
    if (typeof payload === 'boolean') {
      commit('SET_LOADING', { loading: payload })
    } else {
      commit('SET_LOADING', payload)
    }
  },

  setError({ commit }, error) {
    commit('SET_ERROR', error)
  },

  clearError({ commit }) {
    commit('CLEAR_ERROR')
  },

  setOnlineStatus({ commit }, online) {
    commit('SET_ONLINE', online)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
