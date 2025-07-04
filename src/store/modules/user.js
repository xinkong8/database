import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  id: '',
  username: '',
  email: '',
  name: '',
  avatar: '',
  introduction: '',
  roles: ['user'], // Default role
  settings: null
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_USERNAME: (state, username) => {
    state.username = username
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_SETTINGS: (state, settings) => {
    state.settings = settings
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    console.log('🔍 Store login action: 接收到登录请求')
    console.log('用户信息:', { email: username.trim(), password: '***' })

    return new Promise((resolve, reject) => {
      console.log('🔍 Store login action: 准备调用API')

      login({ email: username.trim(), password: password }).then(response => {
        console.log('✅ Store login action: API调用成功，收到响应:', response)

        // Our backend returns { success: true, data: { token, user } }
        if (response.success && response.data) {
          const { token, user } = response.data
          console.log('✅ Store login action: 响应数据有效，保存token和用户信息')

          commit('SET_TOKEN', token)
          setToken(token)

          // Also set user info
          commit('SET_ID', user.id)
          commit('SET_USERNAME', user.username)
          commit('SET_EMAIL', user.email)
          commit('SET_NAME', user.username)
          commit('SET_AVATAR', user.avatar || '')
          commit('SET_SETTINGS', user.UserSetting)

          console.log('✅ Store login action: 用户状态已更新完成')
          resolve(response.data)
        } else {
          console.error('❌ Store login action: 响应数据无效:', response)
          reject(new Error(response.message || '登录失败'))
        }
      }).catch(error => {
        console.error('❌ Store login action: API调用失败:', error)
        console.error('错误详情:', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method
        })
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      console.log('🔍 Store getInfo: 准备获取用户信息')

      getInfo().then(response => {
        console.log('✅ Store getInfo: API调用成功，收到响应:', response)

        if (response.success && response.data) {
          const user = response.data

          // 根据用户邮箱分配角色
          let roles = ['user'] // 默认角色

          // 管理员邮箱列表
          const adminEmails = [
            'test@example.com',
            'admin@example.com'
          ]

          if (adminEmails.includes(user.email)) {
            roles = ['admin', 'user'] // 管理员同时拥有user和admin权限
            console.log('🔑 检测到管理员账号，分配管理员权限')
          }

          commit('SET_ID', user.id)
          commit('SET_USERNAME', user.username)
          commit('SET_EMAIL', user.email)
          commit('SET_NAME', user.username)
          commit('SET_AVATAR', user.avatar || '')
          commit('SET_INTRODUCTION', user.introduction || '')
          commit('SET_ROLES', roles)
          commit('SET_SETTINGS', user.UserSetting)

          console.log('✅ Store getInfo: 用户信息已更新，角色:', roles)

          // 重要：返回包含roles的对象，而不是原始user对象
          resolve({ roles, user })
        } else {
          console.error('❌ Store getInfo: 响应数据无效:', response)
          reject(new Error(response.message || '获取用户信息失败'))
        }
      }).catch(error => {
        console.error('❌ Store getInfo: API调用失败:', error)
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ID', '')
        commit('SET_USERNAME', '')
        commit('SET_EMAIL', '')
        commit('SET_NAME', '')
        commit('SET_AVATAR', '')
        commit('SET_INTRODUCTION', '')
        commit('SET_ROLES', [])
        commit('SET_SETTINGS', null)
        removeToken()
        resetRouter()

        // reset visited views and cached views
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ID', '')
      commit('SET_USERNAME', '')
      commit('SET_EMAIL', '')
      commit('SET_NAME', '')
      commit('SET_AVATAR', '')
      commit('SET_INTRODUCTION', '')
      commit('SET_ROLES', [])
      commit('SET_SETTINGS', null)
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
