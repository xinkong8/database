<template>
  <div id="app">
    <router-view />
    <global-loading />
  </div>
</template>

<script>
import GlobalLoading from '@/components/GlobalLoading'

export default {
  name: 'App',
  components: {
    GlobalLoading
  }
}
</script>
