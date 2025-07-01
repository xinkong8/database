<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="userinfo">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="作者" prop="author">
            <el-input v-model="form.author" />
          </el-form-item>
          <el-form-item label="重要性" prop="importance">
            <el-rate v-model="form.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
          </el-form-item>
          <el-form-item label="阅读时间" prop="reading_time">
            <el-input v-model="form.reading_time" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" class="filter-item" placeholder="请选择">
              <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间戳" prop="timestamp">
            <el-date-picker v-model="form.timestamp" type="datetime" placeholder="请选择日期时间" />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="内容" name="content">
          <el-form-item label="内容">
            <el-input v-model="form.content" :rows="4" type="textarea" />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="设置" name="setting">
          <el-form-item label="页面标题" prop="pageviews">
            <el-input v-model="form.pageviews" />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">创建</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getArticle } from '@/api/article'

export default {
  name: 'CreateArticle',
  data() {
    return {
      activeTab: 'userinfo',
      form: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: 2000,
        title: '',
        type: '',
        status: 'published'
      },
      statusOptions: ['published', 'draft', 'deleted'],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    if (this.$route.params && this.$route.params.id) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
  },
  methods: {
    fetchData(id) {
      getArticle(id).then(response => {
        this.form = response.data
      })
    },
    saveData() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
        } else {
          return false
        }
      })
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
        } else {
          return false
        }
      })
    },
    onCancel() {
      this.$message({
        message: '取消!',
        type: 'warning'
      })
    }
  }
}
</script>

