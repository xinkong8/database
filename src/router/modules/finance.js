import Layout from '@/layout'

const financeRouter = {
  path: '/finance',
  component: Layout,
  redirect: '/finance/income',
  name: 'Finance',
  meta: {
    title: '记账',
    icon: 'money'
  },
  children: [
    {
      path: 'income',
      component: () => import('@/views/finance/income'),
      name: 'Income',
      meta: { title: '收入' }
    },
    {
      path: 'expense',
      component: () => import('@/views/finance/expense'),
      name: 'Expense',
      meta: { title: '支出' }
    },
    {
      path: 'chart',
      component: () => import('@/views/finance'),
      name: 'FinanceChart',
      meta: { title: '账单' }
    }
  ]
}

export default financeRouter
