<template>
  <el-alert
    title="警告"
    type="warning"
    :closable="false"
    show-icon
  >
    <template slot="title">
      警告
    </template>
    <div slot="description">
      <p>1. 这里是一个示例页面，展示了如何创建和编辑文章。</p>
      <p>2. 你可以通过修改 src/views/example 目录下的文件来定制这个页面。</p>
      <p>3. 这个页面使用了 Element UI 组件库。</p>
    </div>
  </el-alert>
</template>

<script>
export default {
  name: 'Warning'
}
</script>

