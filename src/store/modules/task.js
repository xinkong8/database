import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskCategories,
  createTaskCategory,
  updateTaskCategory,
  deleteTaskCategory,
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from '@/api/task'

const state = {
  // 待办事项
  todos: [],

  // 项目
  projects: [],

  // 分类
  categories: [],

  // 优先级选项
  priorities: [
    { value: 'low', label: '低', color: '#909399' },
    { value: 'medium', label: '中', color: '#E6A23C' },
    { value: 'high', label: '高', color: '#F56C6C' },
    { value: 'urgent', label: '紧急', color: '#FF0000' }
  ],

  // 筛选条件
  filter: {
    status: 'all', // all, active, completed
    category: 'all',
    project: 'all',
    priority: 'all'
  }
}

const mutations = {
  // 设置数据
  SET_TODOS(state, todos) {
    state.todos = todos
  },

  SET_PROJECTS(state, projects) {
    state.projects = projects
  },

  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },

  // 待办事项相关
  ADD_TODO(state, todo) {
    state.todos.push(todo)
  },

  UPDATE_TODO(state, todo) {
    const index = state.todos.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      state.todos[index] = todo
    }
  },

  DELETE_TODO(state, id) {
    state.todos = state.todos.filter(todo => todo.id !== id)
  },

  TOGGLE_TODO(state, todo) {
    const index = state.todos.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      state.todos[index] = todo
    }
  },

  // 项目相关
  ADD_PROJECT(state, project) {
    state.projects.push(project)
  },

  UPDATE_PROJECT(state, project) {
    const index = state.projects.findIndex(p => p.id === project.id)
    if (index !== -1) {
      state.projects[index] = project
    }
  },

  DELETE_PROJECT(state, id) {
    state.projects = state.projects.filter(project => project.id !== id)
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
  SET_FILTER(state, { key, value }) {
    state.filter[key] = value
  }
}

const actions = {
  // 获取数据
  async fetchTasks({ commit }, params) {
    const response = await getTasks(params)
    if (response.success) {
      commit('SET_TODOS', response.data)
    }
    return response
  },

  async fetchProjects({ commit }) {
    const response = await getProjects()
    if (response.success) {
      commit('SET_PROJECTS', response.data)
    }
    return response
  },

  async fetchCategories({ commit }) {
    const response = await getTaskCategories()
    if (response.success) {
      commit('SET_CATEGORIES', response.data)
    }
    return response
  },

  // 待办事项相关
  async addTodo({ commit }, todo) {
    const response = await createTask(todo)
    if (response.success) {
      commit('ADD_TODO', response.data)
    }
    return response
  },

  async updateTodo({ commit }, { id, data }) {
    const response = await updateTask(id, data)
    if (response.success) {
      commit('UPDATE_TODO', response.data)
    }
    return response
  },

  async deleteTodo({ commit }, id) {
    const response = await deleteTask(id)
    if (response.success) {
      commit('DELETE_TODO', id)
    }
    return response
  },

  async toggleTodo({ commit }, task) {
    const response = await updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })
    if (response.success) {
      commit('TOGGLE_TODO', response.data)
    }
    return response
  },

  // 项目相关
  async addProject({ commit }, project) {
    const response = await createProject(project)
    if (response.success) {
      commit('ADD_PROJECT', response.data)
    }
    return response
  },

  async updateProject({ commit }, { id, data }) {
    const response = await updateProject(id, data)
    if (response.success) {
      commit('UPDATE_PROJECT', response.data)
    }
    return response
  },

  async deleteProject({ commit }, id) {
    const response = await deleteProject(id)
    if (response.success) {
      commit('DELETE_PROJECT', id)
    }
    return response
  },

  // 分类相关
  async addCategory({ commit }, category) {
    const response = await createTaskCategory(category)
    if (response.success) {
      commit('ADD_CATEGORY', response.data)
    }
    return response
  },

  async updateCategory({ commit }, { id, data }) {
    const response = await updateTaskCategory(id, data)
    if (response.success) {
      commit('UPDATE_CATEGORY', response.data)
    }
    return response
  },

  async deleteCategory({ commit }, id) {
    const response = await deleteTaskCategory(id)
    if (response.success) {
      commit('DELETE_CATEGORY', id)
    }
    return response
  },

  // 筛选相关
  setFilter({ commit }, payload) {
    commit('SET_FILTER', payload)
  }
}

const getters = {
  // 待办事项相关
  allTodos: state => state.todos,

  activeTodos: state => state.todos.filter(todo => !todo.done),

  completedTodos: state => state.todos.filter(todo => todo.done),

  todayTodos: state => {
    const today = new Date().toDateString()
    return state.todos.filter(todo =>
      !todo.done &&
      (!todo.dueDate || new Date(todo.dueDate).toDateString() <= today)
    )
  },

  filteredTodos: state => {
    let todos = state.todos

    // 按完成状态筛选
    if (state.filter.status === 'active') {
      todos = todos.filter(todo => !todo.done)
    } else if (state.filter.status === 'completed') {
      todos = todos.filter(todo => todo.done)
    }

    // 按分类筛选
    if (state.filter.category !== 'all') {
      todos = todos.filter(todo => todo.category === state.filter.category)
    }

    // 按项目筛选
    if (state.filter.project !== 'all') {
      todos = todos.filter(todo => todo.project === parseInt(state.filter.project))
    }

    // 按优先级筛选
    if (state.filter.priority !== 'all') {
      todos = todos.filter(todo => todo.priority === state.filter.priority)
    }

    return todos
  },

  // 项目相关
  allProjects: state => state.projects,

  activeProjects: state => state.projects.filter(project => project.status === 'active'),

  getProjectById: state => id => state.projects.find(project => project.id === id),

  projectProgress: state => id => {
    const projectTodos = state.todos.filter(todo => todo.project === id)
    if (projectTodos.length === 0) return 0
    const completedTodos = projectTodos.filter(todo => todo.done)
    return Math.round((completedTodos.length / projectTodos.length) * 100)
  },

  // 分类相关
  allCategories: state => state.categories,

  getCategoryById: state => id => state.categories.find(category => category.id === id),

  categoryStats: state => {
    return state.categories.map(category => {
      const categoryTodos = state.todos.filter(todo => todo.category === category.id)
      const completedTodos = categoryTodos.filter(todo => todo.done)
      return {
        ...category,
        total: categoryTodos.length,
        completed: completedTodos.length,
        remaining: categoryTodos.length - completedTodos.length
      }
    })
  },

  // 优先级相关
  priorities: state => state.priorities,

  priorityStats: state => {
    return state.priorities.map(priority => {
      const priorityTodos = state.todos.filter(todo => todo.priority === priority.value)
      const completedTodos = priorityTodos.filter(todo => todo.done)
      return {
        ...priority,
        total: priorityTodos.length,
        completed: completedTodos.length,
        remaining: priorityTodos.length - completedTodos.length
      }
    })
  },

  // 统计相关
  taskStats: state => {
    const total = state.todos.length
    const completed = state.todos.filter(todo => todo.done).length
    const active = total - completed
    const today = state.todos.filter(todo => {
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
