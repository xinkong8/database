import request from '@/utils/request'

// 体重记录相关API
export function getWeightRecords(params = {}) {
  // 使用后端通用接口：/api/health?type=weight
  return request({
    url: '/health',
    method: 'get',
    params: { type: 'weight', ...params }
  })
}

export function addWeightRecord(form) {
  // form 中包含 weight、date、notes 等字段
  const payload = {
    type: 'weight',
    value: form.weight,
    unit: 'kg',
    date: form.date instanceof Date ? form.date.toISOString().slice(0, 10) : form.date,
    notes: form.notes || ''
  }
  if (form.height) payload.height = form.height
  return request({
    url: '/health',
    method: 'post',
    data: payload
  })
}

export function updateWeightRecord(id, form) {
  const payload = {
    value: form.weight,
    unit: 'kg',
    date: form.date instanceof Date ? form.date.toISOString().slice(0, 10) : form.date,
    notes: form.notes || ''
  }
  if (form.height) payload.height = form.height
  return request({
    url: `/health/${id}`,
    method: 'put',
    data: payload
  })
}

export function deleteWeightRecord(id) {
  return request({
    url: `/health/${id}`,
    method: 'delete'
  })
}

// ---------------- 运动追踪相关API（统一 /health） ----------------
function fmt(d) {
  if (!d) return null
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)
}

export function getExerciseRecords(params = {}) {
  return request({
    url: '/health',
    method: 'get',
    params: { type: 'exercise', ...params }
  })
}

export function addExerciseRecord(form) {
  const payload = {
    type: 'exercise',
    value: form.duration, // minutes
    unit: 'minutes',
    date: fmt(form.date),
    notes: JSON.stringify({
      exerciseType: form.type,
      calories: form.calories,
      intensity: form.intensity,
      remark: form.notes || ''
    })
  }
  return request({ url: '/health', method: 'post', data: payload })
}

export function updateExerciseRecord(id, form) {
  const payload = {
    value: form.duration,
    unit: 'minutes',
    date: fmt(form.date),
    notes: JSON.stringify({
      exerciseType: form.type,
      calories: form.calories,
      intensity: form.intensity,
      remark: form.notes || ''
    })
  }
  return request({ url: `/health/${id}`, method: 'put', data: payload })
}

export function deleteExerciseRecord(id) {
  return request({ url: `/health/${id}`, method: 'delete' })
}

export function getExerciseTypes() {
  return request({
    url: '/health/exercise/types',
    method: 'get'
  })
}

// ---------------- 睡眠监控相关API（统一 /health） ----------------
function fmtDate(d) {
  if (!d) return null
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)
}

export function getSleepRecords(params = {}) {
  return request({
    url: '/health',
    method: 'get',
    params: { type: 'sleep', ...params }
  })
}

export function addSleepRecord(form) {
  const payload = {
    type: 'sleep',
    value: form.duration, // hours
    unit: 'hours',
    date: fmtDate(form.date),
    notes: JSON.stringify({
      bedtime: form.bedtime,
      wakeup: form.wakeup,
      quality: form.quality,
      remark: form.notes || ''
    })
  }
  return request({ url: '/health', method: 'post', data: payload })
}

export function updateSleepRecord(id, form) {
  const payload = {
    value: form.duration,
    unit: 'hours',
    date: fmtDate(form.date),
    notes: JSON.stringify({
      bedtime: form.bedtime,
      wakeup: form.wakeup,
      quality: form.quality,
      remark: form.notes || ''
    })
  }
  return request({ url: `/health/${id}`, method: 'put', data: payload })
}

export function deleteSleepRecord(id) {
  return request({ url: `/health/${id}`, method: 'delete' })
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
