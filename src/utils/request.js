import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/dev-api', // 使用环境变量或默认值
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// 调试信息 - 确保配置正确
console.log('🔧 Axios配置信息:')
console.log('BaseURL:', service.defaults.baseURL)
console.log('VUE_APP_BASE_API环境变量:', process.env.VUE_APP_BASE_API)

// request interceptor
service.interceptors.request.use(
  config => {
    // 调试日志
    console.log('🔍 Request interceptor: 发送HTTP请求')
    console.log('BaseURL:', config.baseURL)
    console.log('请求路径:', config.url)
    console.log('完整URL:', config.baseURL + config.url)
    console.log('请求方法:', config.method.toUpperCase())
    console.log('请求数据:', config.data)

    if (store.getters.token) {
      // let each request carry token
      // Use Authorization Bearer format for our backend
      config.headers['Authorization'] = `Bearer ${getToken()}`
      console.log('已添加Authorization头')
    } else {
      console.log('无token，跳过Authorization头')
    }
    return config
  },
  error => {
    // do something with request error
    console.error('❌ Request interceptor: 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // Our backend uses success field to indicate success/failure
    if (res.success === false) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.error('❌ Response interceptor: HTTP请求失败')
    console.error('错误信息:', error.message)
    console.error('响应状态:', error.response?.status)
    console.error('请求URL:', error.config?.url)
    console.error('完整URL:', error.config?.baseURL + error.config?.url)
    console.error('请求方法:', error.config?.method)
    console.error('错误详情:', error)

    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      MessageBox.confirm('登录状态已过期，请重新登录', '确认登出', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
    } else {
      Message({
        message: error.message || '网络错误',
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
