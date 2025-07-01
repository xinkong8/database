<template>
  <div class="app-container">
    <aside>
      欢迎使用个人生活管理助手！本系统主要负责帮助您进行记账、存储电子书以及记录代办事项等事务，您可以点击下方的显示引导查看本系统的主要功能，感谢您的支持！
    </aside>
    <el-button icon="el-icon-question" type="primary" @click.prevent.stop="guide">
      显示引导
    </el-button>
  </div>
</template>

<script>
import Driver from 'driver.js' // import driver.js
import 'driver.js/dist/driver.min.css' // import driver.js css
import steps from './steps'

export default {
  name: 'Guide',
  data() {
    return {
      driver: null
    }
  },
  mounted() {
    this.driver = new Driver()
  },
  methods: {
    guide() {
      this.driver.defineSteps(steps)
      this.driver.start()
    }
  }
}
</script>
