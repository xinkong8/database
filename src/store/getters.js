const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  loading: state => state.app.loading,
  loadingMessage: state => state.app.loadingMessage,
  error: state => state.app.error,
  online: state => state.app.online,

  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,

  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  username: state => state.user.username,
  email: state => state.user.email,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  userSettings: state => state.user.settings,

  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,

  // 任务管理相关
  todayTodos: state => {
    const today = new Date().toDateString()
    return state.task.todos.filter(todo => {
      // 包含今天的任务，未完成的任务，以及最近的已完成任务
      if (!todo.dueDate) return !todo.done // 没有截止日期的未完成任务
      const todoDate = new Date(todo.dueDate).toDateString()
      return todoDate === today || (!todo.done && todoDate <= today)
    }).slice(0, 8) // 限制显示8个任务
  },
  taskStats: state => {
    const todos = state.task.todos
    const total = todos.length
    const completed = todos.filter(todo => todo.done).length
    const active = total - completed
    const today = todos.filter(todo => {
      const today = new Date().toDateString()
      return !todo.done && (!todo.dueDate || new Date(todo.dueDate).toDateString() <= today)
    }).length

    return {
      total,
      completed,
      active,
      today,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  },

  // 健康管理相关
  latestWeight: state => state.health?.latestWeight,
  weeklyExerciseCount: state => state.health?.weeklyExerciseCount || 0,
  averageSleepDuration: state => state.health?.averageSleepDuration || 0,
  healthTrend: state => state.health?.healthTrend || {},
  healthDashboardData: state => state.health?.dashboardData || {}
}
export default getters
