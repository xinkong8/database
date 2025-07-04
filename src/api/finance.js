import request from '@/utils/request'

// 财务记录相关API
export function getFinanceRecords(params) {
  return request({
    url: '/finance/records',
    method: 'get',
    params
  })
}

export function createFinanceRecord(data) {
  return request({
    url: '/finance/records',
    method: 'post',
    data
  })
}

export function updateFinanceRecord(id, data) {
  return request({
    url: `/finance/records/${id}`,
    method: 'put',
    data
  })
}

export function deleteFinanceRecord(id) {
  return request({
    url: `/finance/records/${id}`,
    method: 'delete'
  })
}

export function getFinanceStats(params) {
  return request({
    url: '/finance/stats',
    method: 'get',
    params
  })
}

export function getMonthlyTrend(params) {
  return request({
    url: '/finance/trend',
    method: 'get',
    params
  })
}

// 财务分类相关API
export function getFinanceCategories() {
  return request({
    url: '/finance/categories',
    method: 'get'
  })
}

export function createFinanceCategory(data) {
  return request({
    url: '/finance/categories',
    method: 'post',
    data
  })
}

export function updateFinanceCategory(id, data) {
  return request({
    url: `/finance/categories/${id}`,
    method: 'put',
    data
  })
}

export function deleteFinanceCategory(id) {
  return request({
    url: `/finance/categories/${id}`,
    method: 'delete'
  })
}
