import { listProjects, createProject, updateProject as updateProjectApi, deleteProject as deleteProjectApi } from '@/api/project'
import { listTasks, createTask, updateTask as updateTaskApi, deleteTask as deleteTaskApi } from '@/api/task'

const state = {
  // 待办事项
  todos: JSON.parse(localStorage.getItem('todos')) || [
    { id: 1, text: '开始使用个人生活管理助手', done: false, priority: 'high', category: 'personal', project: null, dueDate: null, createdAt: new Date().toISOString() },
    { id: 2, text: '添加第一个待办事项', done: false, priority: 'medium', category: 'personal', project: null, dueDate: null, createdAt: new Date().toISOString() },
    { id: 3, text: '设置个人目标', done: false, priority: 'medium', category: 'personal', project: null, dueDate: null, createdAt: new Date().toISOString() },
    { id: 4, text: '查看仪表板', done: true, priority: 'low', category: 'personal', project: null, dueDate: null, createdAt: new Date().toISOString() },
    { id: 5, text: '学习使用功能', done: true, priority: 'medium', category: 'study', project: null, dueDate: null, createdAt: new Date().toISOString() }
  ],

  // 项目
  projects: JSON.parse(localStorage.getItem('projects')) || [
    { id: 1, name: '个人成长计划', description: '提升个人技能和生活质量', status: 'active', createdAt: new Date().toISOString(), color: '#409EFF' },
    { id: 2, name: '工作效率提升', description: '优化工作流程，提高工作效率', status: 'active', createdAt: new Date().toISOString(), color: '#67C23A' }
  ],

  // 分类
  categories: JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: '个人', color: '#409EFF', icon: 'user' },
    { id: 2, name: '工作', color: '#E6A23C', icon: 'suitcase' },
    { id: 3, name: '学习', color: '#67C23A', icon: 'education' },
    { id: 4, name: '健康', color: '#F56C6C', icon: 'plus' },
    { id: 5, name: '娱乐', color: '#909399', icon: 'star' }
  ],

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
  // 批量设置待办事项
  SET_TODOS(state, todos) {
    state.todos = todos
    localStorage.setItem('todos', JSON.stringify(state.todos))
  },

  // 待办事项相关
  ADD_TODO(state, todo) {
    const newTodo = {
      id: todo.id,
      text: todo.text,
      done: todo.done,
      status: todo.status || (todo.done ? 'completed' : 'pending'),
      priority: todo.priority,
      category: todo.category || 'personal',
      project: todo.project || null,
      dueDate: todo.dueDate || null,
      note: todo.note || '',
      createdAt: todo.createdAt || new Date().toISOString()
    }
    state.todos.push(newTodo)
    localStorage.setItem('todos', JSON.stringify(state.todos))
  },

  UPDATE_TODO(state, { id, updates }) {
    const index = state.todos.findIndex(todo => todo.id === id)
    if (index !== -1) {
      state.todos[index] = { ...state.todos[index], ...updates }
      localStorage.setItem('todos', JSON.stringify(state.todos))
    }
  },

  DELETE_TODO(state, id) {
    state.todos = state.todos.filter(todo => todo.id !== id)
    localStorage.setItem('todos', JSON.stringify(state.todos))
  },

  TOGGLE_TODO(state, id) {
    const todo = state.todos.find(todo => todo.id === id)
    if (todo) {
      todo.done = !todo.done
      localStorage.setItem('todos', JSON.stringify(state.todos))
    }
  },

  TOGGLE_ALL_TODOS(state, done) {
    state.todos.forEach(todo => {
      todo.done = done
    })
    localStorage.setItem('todos', JSON.stringify(state.todos))
  },

  CLEAR_COMPLETED_TODOS(state) {
    state.todos = state.todos.filter(todo => !todo.done)
    localStorage.setItem('todos', JSON.stringify(state.todos))
  },

  // 批量设置项目（覆盖本地）
  SET_PROJECTS(state, projects) {
    state.projects = projects
    localStorage.setItem('projects', JSON.stringify(state.projects))
  },

  // 项目相关
  ADD_PROJECT(state, project) {
    const newProject = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      status: project.status || 'active',
      color: project.color || '#409EFF',
      createdAt: project.created_at || project.createdAt || new Date().toISOString()
    }
    state.projects.push(newProject)
    localStorage.setItem('projects', JSON.stringify(state.projects))
  },

  UPDATE_PROJECT(state, { id, updates }) {
    const index = state.projects.findIndex(project => project.id === id)
    if (index !== -1) {
      state.projects[index] = { ...state.projects[index], ...updates }
      localStorage.setItem('projects', JSON.stringify(state.projects))
    }
  },

  DELETE_PROJECT(state, id) {
    // 删除项目时，将相关任务的项目设置为null
    state.todos.forEach(todo => {
      if (todo.project === id) {
        todo.project = null
      }
    })
    state.projects = state.projects.filter(project => project.id !== id)
    localStorage.setItem('projects', JSON.stringify(state.projects))
    localStorage.setItem('todos', JSON.stringify(state.todos))
  },

  // 分类相关
  ADD_CATEGORY(state, category) {
    const newCategory = {
      id: Date.now(),
      name: category.name,
      color: category.color || '#409EFF',
      icon: category.icon || 'component',
      ...category
    }
    state.categories.push(newCategory)
    localStorage.setItem('categories', JSON.stringify(state.categories))
  },

  UPDATE_CATEGORY(state, { id, updates }) {
    const index = state.categories.findIndex(category => category.id === id)
    if (index !== -1) {
      state.categories[index] = { ...state.categories[index], ...updates }
      localStorage.setItem('categories', JSON.stringify(state.categories))
    }
  },

  DELETE_CATEGORY(state, id) {
    // 删除分类时，将相关任务的分类设置为默认分类
    state.todos.forEach(todo => {
      if (todo.category === id) {
        todo.category = 'personal'
      }
    })
    state.categories = state.categories.filter(category => category.id !== id)
    localStorage.setItem('categories', JSON.stringify(state.categories))
    localStorage.setItem('todos', JSON.stringify(state.todos))
  },

  // 筛选相关
  SET_FILTER(state, { key, value }) {
    state.filter[key] = value
  }
}

const actions = {
  // 拉取待办事项列表
  async fetchTodos({ commit }) {
    const res = await listTasks({ limit: 1000 }) // 获取足够多的任务，前端自行分页
    const mapPriority = n => {
      if (n <= 2) return 'low'
      if (n === 3) return 'medium'
      if (n === 4) return 'high'
      return 'urgent'
    }
    const todos = (res.tasks || []).map(t => ({
      id: t.id,
      text: t.title,
      done: t.status === 'completed',
      status: t.status,
      priority: mapPriority(t.priority),
      category: 'personal',
      project: t.project_id,
      dueDate: t.due_date,
      note: t.description || '',
      createdAt: t.created_at
    }))
    commit('SET_TODOS', todos)
  },

  // 待办事项相关
  async addTodo({ commit }, todo) {
    const priorityMap = { low: 1, medium: 3, high: 4, urgent: 5 }
    const payload = {
      title: todo.text,
      priority: priorityMap[todo.priority] || 3
    }
    if (todo.note) {
      payload.description = todo.note.trim()
    }
    if (todo.dueDate) {
      payload.due_date = formatDate(todo.dueDate)
    }
    if (todo.project) {
      payload.project_id = todo.project
    }
    const data = await createTask(payload)
    const saved = {
      id: data.id,
      text: data.title,
      done: data.status === 'completed',
      status: data.status,
      priority: todo.priority,
      category: todo.category || 'personal',
      project: data.project_id,
      dueDate: data.due_date,
      note: data.description || todo.note || '',
      createdAt: data.created_at
    }
    commit('ADD_TODO', saved)
  },

  async updateTodo({ commit }, { id, updates }) {
    const priorityMap = { low: 1, medium: 3, high: 4, urgent: 5 }
    const apiUpdates = {}
    if (updates.text !== undefined) apiUpdates.title = updates.text
    if (updates.note !== undefined) apiUpdates.description = updates.note
    if (updates.priority !== undefined) apiUpdates.priority = priorityMap[updates.priority] || 3
    if (updates.dueDate !== undefined) apiUpdates.due_date = formatDate(updates.dueDate)
    if (updates.project !== undefined) apiUpdates.project_id = updates.project
    if (updates.done !== undefined) {
      apiUpdates.status = updates.done ? 'completed' : 'pending'
    }

    await updateTaskApi(id, apiUpdates)
    commit('UPDATE_TODO', { id, updates })
  },

  async deleteTodo({ commit }, id) {
    await deleteTaskApi(id)
    commit('DELETE_TODO', id)
  },

  async toggleTodo({ state, commit }, id) {
    const todo = state.todos.find(t => t.id === id)
    if (!todo) return
    const newStatus = todo.done ? 'completed' : 'pending'
    await updateTaskApi(id, { status: newStatus })
    commit('UPDATE_TODO', { id, updates: { status: newStatus }})
  },

  toggleAllTodos({ commit }, done) {
    commit('TOGGLE_ALL_TODOS', done)
  },

  clearCompletedTodos({ commit }) {
    commit('CLEAR_COMPLETED_TODOS')
  },

  // 拉取项目列表
  async fetchProjects({ commit }) {
    const res = await listProjects()
    // 后端 data.projects
    const projects = (res.projects || []).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      color: p.color,
      createdAt: p.created_at
    }))
    commit('SET_PROJECTS', projects)
  },

  // 项目相关
  async addProject({ commit }, project) {
    // 调用后端创建
    const data = await createProject(project)
    const saved = {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      color: data.color,
      createdAt: data.created_at
    }
    commit('ADD_PROJECT', saved)
  },

  async updateProject({ commit }, { id, updates }) {
    await updateProjectApi(id, updates)
    commit('UPDATE_PROJECT', { id, updates })
  },

  async deleteProject({ commit }, id) {
    await deleteProjectApi(id)
    commit('DELETE_PROJECT', id)
  },

  // 分类相关
  addCategory({ commit }, category) {
    commit('ADD_CATEGORY', category)
  },

  updateCategory({ commit }, payload) {
    commit('UPDATE_CATEGORY', payload)
  },

  deleteCategory({ commit }, id) {
    commit('DELETE_CATEGORY', id)
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

// 工具：格式化日期为 YYYY-MM-DD（支持 Date 对象 / 字符串）
const formatDate = (d) => {
  if (!d) return null
  if (d instanceof Date) {
    return d.toISOString().slice(0, 10)
  }
  if (typeof d === 'string') {
    // 处理 '2025-07-06T16:00:00.000Z' 或 '2025-07-06'
    return d.slice(0, 10)
  }
  return null
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
