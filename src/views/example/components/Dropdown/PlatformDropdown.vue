<template>
  <el-dropdown trigger="click" @command="handleSetPlatform">
    <div>
      <svg-icon class-name="colorSVG" icon-class="platform" />
      <span>{{ platformText }}</span>
      <i class="el-icon-caret-bottom" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="a-platform">
        <span>平台A</span>
      </el-dropdown-item>
      <el-dropdown-item command="b-platform">
        <span>平台B</span>
      </el-dropdown-item>
      <el-dropdown-item command="c-platform">
        <span>平台C</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'PlatformDropdown',
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    platformText() {
      return this.value.length > 0 ? this.value.join(' ') : '选择平台'
    }
  },
  methods: {
    handleSetPlatform(type) {
      const result = this.value.indexOf(type)
      if (result > -1) {
        this.value.splice(result, 1)
      } else {
        this.value.push(type)
      }
      this.$emit('input', this.value)
    }
  }
}
</script>
