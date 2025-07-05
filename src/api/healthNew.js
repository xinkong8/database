import request from '@/utils/request'

export function listHealthRecords(params) {
  return request({
    url: '/health',
    method: 'get',
    params
  })
}

export function getHealthRecord(id) {
  return request({
    url: `/health/${id}`,
    method: 'get'
  })
}

export function createHealthRecord(data) {
  return request({
    url: '/health',
    method: 'post',
    data
  })
}

export function updateHealthRecord(id, data) {
  return request({
    url: `/health/${id}`,
    method: 'put',
    data
  })
}

export function deleteHealthRecord(id) {
  return request({
    url: `/health/${id}`,
    method: 'delete'
  })
}
