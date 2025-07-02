// 获取日期属于哪一年第几周
export function getWeek(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const firstDay = new Date(year, 0, 1)
  const dayOfWeek = firstDay.getDay() || 7
  const dayOfYear = Math.floor((date - firstDay) / 86400000) + 1
  const week = Math.ceil((dayOfYear + dayOfWeek - 1) / 7)
  return `${year}-W${week}`
}

// 获取周的日期范围
export function getWeekRange(weekStr) {
  const [year, w] = weekStr.split('-W')
  const week = parseInt(w)
  const firstDay = new Date(year, 0, 1)
  const dayOfWeek = firstDay.getDay() || 7
  const start = new Date(firstDay.getTime() + (week - 1) * 7 * 86400000 - (dayOfWeek - 1) * 86400000)
  const end = new Date(start.getTime() + 6 * 86400000)
  const pad = n => n.toString().padStart(2, '0')
  return `${start.getMonth() + 1}.${pad(start.getDate())}-${end.getMonth() + 1}.${pad(end.getDate())}`
}

// 获取日期的月份字符串 yyyy-MM
export function getMonth(dateStr) {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${y}-${m}`
}
