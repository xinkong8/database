import Layout from '@/layout'

const healthRouter = {
  path: '/health',
  component: Layout,
  redirect: '/health/overview',
  name: 'Health',
  meta: {
    title: '健康管理',
    icon: 'el-icon-s-custom'
  },
  children: [
    {
      path: 'overview',
      component: () => import('@/views/health/overview'),
      name: 'HealthOverview',
      meta: { title: '健康概览', icon: 'dashboard' }
    },
    {
      path: 'weight',
      component: () => import('@/views/health/weight'),
      name: 'WeightRecord',
      meta: { title: '体重记录', icon: 'el-icon-scale' }
    },
    {
      path: 'exercise',
      component: () => import('@/views/health/exercise'),
      name: 'ExerciseTracking',
      meta: { title: '运动追踪', icon: 'el-icon-bicycle' }
    },
    {
      path: 'sleep',
      component: () => import('@/views/health/sleep'),
      name: 'SleepMonitor',
      meta: { title: '睡眠监控', icon: 'el-icon-moon-night' }
    },
    {
      path: 'metrics',
      component: () => import('@/views/health/metrics'),
      name: 'HealthMetrics',
      meta: { title: '健康指标', icon: 'chart' }
    }
  ]
}

export default healthRouter
