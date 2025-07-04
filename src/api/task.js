import request from '@/utils/request'

// 任务相关API
export function getTasks(params) {
  return request({
    url: '/tasks',
    method: 'get',
    params
  })
}

export function createTask(data) {
  return request({
    url: '/tasks',
    method: 'post',
    data
  })
}

export function updateTask(id, data) {
  return request({
    url: `/tasks/${id}`,
    method: 'put',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'delete'
  })
}

export function getTaskStats() {
  return request({
    url: '/tasks/stats',
    method: 'get'
  })
}

// 任务分类相关API
export function getTaskCategories() {
  return request({
    url: '/tasks/categories',
    method: 'get'
  })
}

export function createTaskCategory(data) {
  return request({
    url: '/tasks/categories',
    method: 'post',
    data
  })
}

export function updateTaskCategory(id, data) {
  return request({
    url: `/tasks/categories/${id}`,
    method: 'put',
    data
  })
}

export function deleteTaskCategory(id) {
  return request({
    url: `/tasks/categories/${id}`,
    method: 'delete'
  })
}

// 项目相关API
export function getProjects() {
  return request({
    url: '/tasks/projects',
    method: 'get'
  })
}

export function createProject(data) {
  return request({
    url: '/tasks/projects',
    method: 'post',
    data
  })
}

export function updateProject(id, data) {
  return request({
    url: `/tasks/projects/${id}`,
    method: 'put',
    data
  })
}

export function deleteProject(id) {
  return request({
    url: `/tasks/projects/${id}`,
    method: 'delete'
  })
}
