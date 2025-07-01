<template>
  <el-dropdown trigger="click" @command="handleSetComment">
    <div>
      <svg-icon class-name="colorSVG" icon-class="comment" />
      <span>{{ commentText }}</span>
      <i class="el-icon-caret-bottom" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="open">
        <span>开启评论</span>
      </el-dropdown-item>
      <el-dropdown-item command="close">
        <span>关闭评论</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'CommentDropdown',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    commentText() {
      return this.value ? '关闭评论' : '开启评论'
    }
  },
  methods: {
    handleSetComment(type) {
      this.$emit('input', type === 'open')
    }
  }
}
</script>
