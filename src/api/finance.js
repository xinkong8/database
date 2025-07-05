import request from '@/utils/request'

// 获取财务记录列表
export function listFinanceRecords(params) {
  return request({
    url: '/finance',
    method: 'get',
    params
  })
}

// 获取单条财务记录
export function getFinanceRecord(id) {
  return request({
    url: `/finance/${id}`,
    method: 'get'
  })
}

// 创建财务记录
export function createFinanceRecord(data) {
  return request({
    url: '/finance',
    method: 'post',
    data
  })
}

// 更新财务记录
export function updateFinanceRecord(id, data) {
  return request({
    url: `/finance/${id}`,
    method: 'put',
    data
  })
}

// 删除财务记录
export function deleteFinanceRecord(id) {
  return request({
    url: `/finance/${id}`,
    method: 'delete'
  })
}
