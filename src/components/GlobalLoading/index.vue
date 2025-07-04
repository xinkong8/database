<template>
  <div v-if="loading" class="global-loading">
    <div class="loading-content">
      <el-spinner size="40" />
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlobalLoading',
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    message() {
      return this.$store.getters.loadingMessage || '加载中...'
    }
  }
}
</script>

<style lang="scss" scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .loading-content {
    text-align: center;

    p {
      margin-top: 16px;
      color: #666;
      font-size: 14px;
    }
  }
}
</style>
