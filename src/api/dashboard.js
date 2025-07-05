import request from '@/utils/request'

// 仪表盘总览
export function fetchDashboard() {
  return request({
    url: '/dashboard',
    method: 'get'
  })
}

// 最近 7 天趋势
export function fetchTrends() {
  return request({
    url: '/dashboard/trends',
    method: 'get'
  })
}

// 快速统计
export function fetchQuickStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

// 财务概览
export function fetchFinanceOverview() {
  return request({
    url: '/dashboard/finance-overview',
    method: 'get'
  })
}

// 任务概览
export function fetchTaskOverview() {
  return request({
    url: '/dashboard/task-overview',
    method: 'get'
  })
}

// 健康概览
export function fetchHealthOverview() {
  return request({
    url: '/dashboard/health-overview',
    method: 'get'
  })
}
