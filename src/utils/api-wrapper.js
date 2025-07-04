import store from '@/store'

// API请求包装器，自动处理加载状态
export function apiWrapper(apiCall, options = {}) {
  const {
    showLoading = true,
    loadingMessage = '加载中...',
    showError = true
  } = options

  return async(...args) => {
    try {
      // 显示加载状态
      if (showLoading) {
        store.dispatch('app/setLoading', {
          loading: true,
          message: loadingMessage
        })
      }

      // 执行API调用
      const response = await apiCall(...args)

      // 清除错误状态
      store.dispatch('app/clearError')

      return response
    } catch (error) {
      console.error('API调用失败:', error)

      // 设置错误状态
      if (showError) {
        store.dispatch('app/setError', {
          message: error.message || '请求失败',
          code: error.code,
          timestamp: new Date().toISOString()
        })
      }

      throw error
    } finally {
      // 隐藏加载状态
      if (showLoading) {
        store.dispatch('app/setLoading', { loading: false })
      }
    }
  }
}

// 批量API请求包装器
export function batchApiWrapper(apiCalls, options = {}) {
  const {
    showLoading = true,
    loadingMessage = '加载中...',
    showError = true
  } = options

  return async() => {
    try {
      if (showLoading) {
        store.dispatch('app/setLoading', {
          loading: true,
          message: loadingMessage
        })
      }

      const results = await Promise.all(apiCalls.map(call =>
        typeof call === 'function' ? call() : call
      ))

      store.dispatch('app/clearError')
      return results
    } catch (error) {
      console.error('批量API调用失败:', error)

      if (showError) {
        store.dispatch('app/setError', {
          message: error.message || '请求失败',
          code: error.code,
          timestamp: new Date().toISOString()
        })
      }

      throw error
    } finally {
      if (showLoading) {
        store.dispatch('app/setLoading', { loading: false })
      }
    }
  }
}
