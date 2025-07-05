import request from '@/utils/request'

export function listTasks(params) {
  return request({
    url: '/tasks',
    method: 'get',
    params
  })
}

export function getTask(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'get'
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
