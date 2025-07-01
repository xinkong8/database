<template>
  <div>
    <sticky :z-index="10" class-name="sub-navbar">
      <el-dropdown trigger="click">
        <el-button plain>
          平台<i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" class="no-border">
          <el-checkbox-group v-model="platforms" style="padding: 5px 15px;">
            <el-checkbox v-for="item in platformsOptions" :key="item.key" :label="item.key">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown trigger="click">
        <el-button plain>
          链接<i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" class="no-padding no-border" style="width:300px">
          <el-input v-model="url" placeholder="请输入内容">
            <template slot="prepend">
              网址
            </template>
          </el-input>
        </el-dropdown-menu>
      </el-dropdown>

      <div class="time-container">
        <el-date-picker v-model="time" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="发布时间" />
      </div>

      <el-button style="margin-left: 10px;" type="success">
        发布
      </el-button>
    </sticky>

    <div class="components-container">
      <aside>
        粘性头部，当页面滚动到预设位置时会在顶部粘性显示。
      </aside>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <sticky :sticky-top="200">
        <el-button type="primary"> 占位符</el-button>
      </sticky>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
      <div>占位符</div>
    </div>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky'

export default {
  name: 'StickyDemo',
  components: { Sticky },
  data() {
    return {
      time: '',
      url: '',
      platforms: ['a-platform'],
      platformsOptions: [
        { key: 'a-platform', name: '平台A' },
        { key: 'b-platform', name: '平台B' },
        { key: 'c-platform', name: '平台C' }
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      }
    }
  }
}
</script>

<style scoped>
.components-container div {
  margin: 10px;
}

.time-container {
  display: inline-block;
}
</style>
