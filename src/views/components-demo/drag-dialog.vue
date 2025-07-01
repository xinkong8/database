<template>
  <div class="components-container">
    <el-button type="primary" @click="dialogTableVisible = true">
      打开拖拽对话框
    </el-button>
    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="收货地址" @dragDialog="handleDrag">
      <el-select ref="select" v-model="value" placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-table :data="gridData">
        <el-table-column property="date" label="日期" width="150" />
        <el-table-column property="name" label="姓名" width="200" />
        <el-table-column property="address" label="地址" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui

export default {
  name: 'DragDialogDemo',
  directives: { elDragDialog },
  data() {
    return {
      dialogTableVisible: false,
      options: [
        { value: '选项1', label: '黄金糕' },
        { value: '选项2', label: '双皮奶' },
        { value: '选项3', label: '蚵仔煎' },
        { value: '选项4', label: '龙须面' }
      ],
      value: '',
      gridData: [{
        date: '2016-05-02',
        name: '张三',
        address: '普陀区金沙江路 1518 号'
      }, {
        date: '2016-05-04',
        name: '李四',
        address: '普陀区金沙江路 1518 号'
      }, {
        date: '2016-05-01',
        name: '王五',
        address: '普陀区金沙江路 1518 号'
      }, {
        date: '2016-05-03',
        name: '赵六',
        address: '普陀区金沙江路 1518 号'
      }]
    }
  },
  methods: {
    // v-el-drag-dialog 拖拽回调函数
    handleDrag() {
      this.$refs.select.blur()
    }
  }
}
</script>
