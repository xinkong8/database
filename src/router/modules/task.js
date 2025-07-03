import Layout from '@/layout'

const taskRouter = {
  path: '/task',
  component: Layout,
  redirect: '/task/overview',
  name: 'Task',
  meta: {
    title: '任务管理',
    icon: 'list'
  },
  children: [
    {
      path: 'overview',
      component: () => import('@/views/task/overview'),
      name: 'TaskOverview',
      meta: { title: '任务概览', icon: 'dashboard' }
    },
    {
      path: 'todo',
      component: () => import('@/views/task/todo'),
      name: 'TodoManagement',
      meta: { title: '待办事项', icon: 'list' }
    },
    {
      path: 'project',
      component: () => import('@/views/task/project'),
      name: 'ProjectManagement',
      meta: { title: '项目管理', icon: 'tree' }
    },
    {
      path: 'progress',
      component: () => import('@/views/task/progress'),
      name: 'ProgressTracking',
      meta: { title: '进度追踪', icon: 'chart' }
    },
    {
      path: 'category',
      component: () => import('@/views/task/category'),
      name: 'CategoryManagement',
      meta: { title: '分类管理', icon: 'component' }
    }
  ]
}

export default taskRouter
