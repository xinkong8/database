<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in displayRoutes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import { constantRoutes, asyncRoutes } from '@/router'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar'
    ]),
    displayRoutes() {
      // 如果有权限路由，优先使用权限路由
      if (this.permission_routes && this.permission_routes.length > 0) {
        return this.permission_routes
      }

      // 否则使用基础路由 + 所有异步路由，确保菜单始终显示
      const basicRoutes = constantRoutes.filter(route => {
        // 过滤掉隐藏的路由和登录相关路由
        return !route.hidden && route.path !== '/login' && route.path !== '/auth-redirect' && route.path !== '/404' && route.path !== '/401' && route.path !== '/redirect'
      })

      // 添加所有异步路由（所有功能模块）
      const allRoutes = [...basicRoutes, ...asyncRoutes.filter(route => route.path !== '*')]

      console.log('🎯 Sidebar displayRoutes: 使用备用路由显示菜单')
      console.log('显示的路由数量:', allRoutes.length)
      console.log('路由列表:', allRoutes.map(r => r.path || r.name))

      return allRoutes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
