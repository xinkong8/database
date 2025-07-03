import request from '@/utils/request'

// 体重记录相关API
export function getWeightRecords(params) {
  return request({
    url: '/health/weight/records',
    method: 'get',
    params
  })
}

export function addWeightRecord(data) {
  return request({
    url: '/health/weight/add',
    method: 'post',
    data
  })
}

export function updateWeightRecord(id, data) {
  return request({
    url: `/health/weight/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteWeightRecord(id) {
  return request({
    url: `/health/weight/delete/${id}`,
    method: 'delete'
  })
}

// 运动追踪相关API
export function getExerciseRecords(params) {
  return request({
    url: '/health/exercise/records',
    method: 'get',
    params
  })
}

export function addExerciseRecord(data) {
  return request({
    url: '/health/exercise/add',
    method: 'post',
    data
  })
}

export function updateExerciseRecord(id, data) {
  return request({
    url: `/health/exercise/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteExerciseRecord(id) {
  return request({
    url: `/health/exercise/delete/${id}`,
    method: 'delete'
  })
}

export function getExerciseTypes() {
  return request({
    url: '/health/exercise/types',
    method: 'get'
  })
}

// 睡眠监控相关API
export function getSleepRecords(params) {
  return request({
    url: '/health/sleep/records',
    method: 'get',
    params
  })
}

export function addSleepRecord(data) {
  return request({
    url: '/health/sleep/add',
    method: 'post',
    data
  })
}

export function updateSleepRecord(id, data) {
  return request({
    url: `/health/sleep/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteSleepRecord(id) {
  return request({
    url: `/health/sleep/delete/${id}`,
    method: 'delete'
  })
}

// 健康指标相关API
export function getHealthMetrics(params) {
  return request({
    url: '/health/metrics/records',
    method: 'get',
    params
  })
}

export function addHealthMetric(data) {
  return request({
    url: '/health/metrics/add',
    method: 'post',
    data
  })
}

export function updateHealthMetric(id, data) {
  return request({
    url: `/health/metrics/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteHealthMetric(id) {
  return request({
    url: `/health/metrics/delete/${id}`,
    method: 'delete'
  })
}

// 健康数据统计API
export function getHealthStatistics(params) {
  return request({
    url: '/health/statistics',
    method: 'get',
    params
  })
}

export function getHealthDashboard() {
  return request({
    url: '/health/dashboard',
    method: 'get'
  })
}

export function getHealthTrends(type, period) {
  return request({
    url: '/health/trends',
    method: 'get',
    params: { type, period }
  })
}
