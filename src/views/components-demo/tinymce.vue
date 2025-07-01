<template>
  <div class="components-container">
    <aside>富文本编辑器基于
      <a href="https://github.com/tinymce/tinymce" target="_blank">TinyMCE</a>，简单地用Vue包装。
      <a
        target="_blank"
        href="https://panjiachen.github.io/vue-element-admin-site/feature/component/tinymce.html"
      >
        文档 </a>
    </aside>
    <div>
      <tinymce v-model="content" :height="300" />
    </div>
    <div class="editor-content" v-html="content" />
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'

export default {
  name: 'TinymceDemo',
  components: { Tinymce },
  data() {
    return {
      content:
      `<h1 style="text-align: center;">欢迎使用个人生活管理助手！</h1><p style="text-align: center; font-size: 15px;"><img title="TinyMCE Logo" src="//www.tinymce.com/images/glyph-tinymce@2x.png" alt="TinyMCE Logo" width="110" height="97" /><ul>
        <li>这是一个功能强大的个人生活管理工具。</li><li>帮助您更好地管理日常事务。</li><li>提供丰富的功能组件和个性化设置。</li>
      </ul>`
    }
  }
}
</script>

<style scoped>
.editor-content{
  margin-top: 20px;
}
</style>

