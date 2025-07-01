<template>
  <el-dropdown trigger="click" @command="handleSetSourceUrl">
    <div>
      <svg-icon class-name="colorSVG" icon-class="source" />
      <span>{{ sourceUrlText }}</span>
      <i class="el-icon-caret-bottom" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="source1">
        <span>源链接1</span>
      </el-dropdown-item>
      <el-dropdown-item command="source2">
        <span>源链接2</span>
      </el-dropdown-item>
      <el-dropdown-item command="source3">
        <span>源链接3</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'SourceUrlDropdown',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    sourceUrlText() {
      return this.value || '选择源链接'
    }
  },
  methods: {
    handleSetSourceUrl(type) {
      this.$emit('input', type)
    }
  }
}
</script>
