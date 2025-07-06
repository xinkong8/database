import request from '@/utils/request'

export function listProjects(params) {
  return request({
    url: '/projects',
    method: 'get',
    params
  })
}

export function getProject(id) {
  return request({
    url: `/projects/${id}`,
    method: 'get'
  })
}

export function createProject(data) {
  return request({
    url: '/projects',
    method: 'post',
    data
  })
}

export function updateProject(id, data) {
  return request({
    url: `/projects/${id}`,
    method: 'put',
    data
  })
}

export function deleteProject(id) {
  return request({
    url: `/projects/${id}`,
    method: 'delete'
  })
}
