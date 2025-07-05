import request from '@/utils/request'

// 获取指定月份预算列表
export function listBudgets(params) {
  return request({
    url: '/finance/budgets',
    method: 'get',
    params
  })
}

// 保存（新增/更新）预算
export function saveBudget(data) {
  return request({
    url: '/finance/budgets',
    method: 'post',
    data
  })
}

// 删除预算
export function deleteBudget(data) {
  return request({
    url: '/finance/budgets',
    method: 'delete',
    data
  })
}
