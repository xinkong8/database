const steps = [
  {
    element: '#hamburger-container',
    popover: {
      title: '菜单按钮',
      description: '打开和关闭侧边栏,快速切换功能模块',
      position: 'bottom'
    }
  },
  {
    element: '#breadcrumb-container',
    popover: {
      title: '导航栏',
      description: '指示当前页面位置，方便快速返回',
      position: 'bottom'
    }
  },
  {
    element: '#header-search',
    popover: {
      title: '快速搜索',
      description: '搜索任务、账单、笔记等内容',
      position: 'left'
    }
  },
  {
    element: '#screenfull',
    popover: {
      title: '全屏模式',
      description: '专注模式，隐藏浏览器边缘',
      position: 'left'
    }
  },
  {
    element: '#tags-view-container',
    popover: {
      title: '页面标签',
      description: '快速切换最近访问的功能页面',
      position: 'bottom'
    },
    padding: 0
  }
]

export default steps
