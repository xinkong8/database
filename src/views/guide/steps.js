const steps = [
  {
    element: '#hamburger-container',
    popover: {
      title: '菜单按钮',
      description: '打开和关闭侧边栏',
      position: 'bottom'
    }
  },
  {
    element: '#breadcrumb-container',
    popover: {
      title: '状态栏',
      description: '指示当前页面位置',
      position: 'bottom'
    }
  },
  {
    element: '#header-search',
    popover: {
      title: '页面搜索',
      description: '页面搜索，快速导航',
      position: 'left'
    }
  },
  {
    element: '#screenfull',
    popover: {
      title: '全屏',
      description: '设置页面为全屏',
      position: 'left'
    }
  },
  {
    element: '#size-select',
    popover: {
      title: '切换尺寸',
      description: '切换系统尺寸',
      position: 'left'
    }
  },
  {
    element: '#tags-view-container',
    popover: {
      title: '标签视图',
      description: '你访问过页面的历史记录',
      position: 'bottom'
    },
    padding: 0
  }
]

export default steps
