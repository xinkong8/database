/**
 * 性能优化工具
 * 处理Chrome浏览器的性能警告
 */

// 优化触摸事件监听器
export function addPassiveEventListener(element, event, handler, options = {}) {
  if (typeof options === 'boolean') {
    options = { passive: options }
  }

  // 默认为passive事件监听器
  const finalOptions = {
    passive: true,
    ...options
  }

  element.addEventListener(event, handler, finalOptions)
}

// 移除事件监听器
export function removeEventListener(element, event, handler, options = {}) {
  element.removeEventListener(event, handler, options)
}

// Element UI 弹窗优化配置
export const dialogOptimizedConfig = {
  // 关闭时销毁DOM，避免内存泄漏
  destroyOnClose: true,
  // 禁用点击遮罩关闭，避免意外关闭
  closeOnClickModal: false,
  // 禁用ESC关闭，提供更好的用户体验
  closeOnPressEscape: false,
  // 显示关闭按钮
  showClose: true,
  // 添加过渡动画
  customClass: 'optimized-dialog'
}

// 抑制Chrome性能警告（仅用于开发环境）
export function suppressPerformanceWarnings() {
  if (process.env.NODE_ENV === 'development') {
    // 临时抑制 passive event listener 警告
    const originalAddEventListener = EventTarget.prototype.addEventListener
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (typeof options === 'undefined') {
        options = { passive: false }
      } else if (typeof options === 'boolean') {
        options = { passive: false, capture: options }
      } else if (typeof options === 'object' && options.passive === undefined) {
        options.passive = false
      }

      // 对于滚动相关事件，默认设置为passive
      if (['touchstart', 'touchmove', 'wheel', 'mousewheel'].includes(type)) {
        if (typeof options === 'object') {
          options.passive = true
        }
      }

      return originalAddEventListener.call(this, type, listener, options)
    }
  }
}

// 组件清理助手
export const componentCleanupMixin = {
  beforeDestroy() {
    // 清理所有定时器
    if (this.$options._timers) {
      this.$options._timers.forEach(timer => clearTimeout(timer))
      this.$options._timers = []
    }

    // 清理所有事件监听器
    if (this.$options._listeners) {
      this.$options._listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options)
      })
      this.$options._listeners = []
    }
  },

  methods: {
    // 安全的定时器设置
    $safeTimeout(callback, delay) {
      if (!this.$options._timers) {
        this.$options._timers = []
      }
      const timer = setTimeout(() => {
        callback()
        // 从列表中移除已完成的定时器
        const index = this.$options._timers.indexOf(timer)
        if (index > -1) {
          this.$options._timers.splice(index, 1)
        }
      }, delay)

      this.$options._timers.push(timer)
      return timer
    },

    // 安全的事件监听器添加
    $safeAddEventListener(element, event, handler, options = {}) {
      if (!this.$options._listeners) {
        this.$options._listeners = []
      }

      const finalOptions = {
        passive: true,
        ...options
      }

      element.addEventListener(event, handler, finalOptions)
      this.$options._listeners.push({ element, event, handler, options: finalOptions })
    }
  }
}
