import Layout from '@/layout'

const financeRouter = {
  path: '/finance',
  component: Layout,
  redirect: '/finance/overview',
  name: 'Finance',
  meta: {
    title: '财务管理',
    icon: 'money'
  },
  children: [
    {
      path: 'overview',
      component: () => import('@/views/finance/overview'),
      name: 'FinanceOverview',
      meta: { title: '财务概览', icon: 'dashboard' }
    },
    {
      path: 'record',
      component: () => import('@/views/finance/record'),
      name: 'FinanceRecord',
      meta: { title: '记账', icon: 'edit' }
    },
    {
      path: 'records',
      component: () => import('@/views/finance/records'),
      name: 'FinanceRecords',
      meta: { title: '记录管理', icon: 'list' }
    },
    {
      path: 'budget',
      component: () => import('@/views/finance/budget'),
      name: 'FinanceBudget',
      meta: { title: '预算管理', icon: 'money' }
    },
    {
      path: 'statistics',
      component: () => import('@/views/finance/statistics'),
      name: 'FinanceStatistics',
      meta: { title: '统计分析', icon: 'chart' }
    },
    {
      path: 'settings',
      component: () => import('@/views/finance/settings'),
      name: 'FinanceSettings',
      meta: { title: '分类设置', icon: 'setting' }
    }
  ]
}

export default financeRouter
