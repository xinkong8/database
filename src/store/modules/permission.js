import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      console.log('🔍 Permission generateRoutes: 开始生成路由')
      console.log('用户角色:', roles)
      console.log('可用的异步路由数量:', asyncRoutes.length)
      console.log('异步路由列表:', asyncRoutes.map(r => r.path || r.name))

      let accessedRoutes
      if (roles.includes('admin')) {
        console.log('✅ 用户是管理员，获取所有路由')
        accessedRoutes = asyncRoutes || []
      } else {
        console.log('🔍 用户是普通用户，过滤路由权限')
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }

      console.log('✅ 最终可访问路由数量:', accessedRoutes.length)
      console.log('最终可访问路由:', accessedRoutes.map(r => r.path || r.name))

      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
