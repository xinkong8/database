
<template>
  <div class="quick-actions">
    <div class="action-grid">
      <div
        v-for="action in actions"
        :key="action.id"
        class="action-item"
        @click="handleAction(action)"
      >
        <div class="action-icon" :style="{ backgroundColor: action.color }">
          <i :class="action.icon" />
        </div>
        <div class="action-label">{{ action.label }}</div>
      </div>
    </div>

    <div class="stats-section">
      <h5>今日统计</h5>
      <div class="stat-item">
        <span class="stat-label">完成任务</span>
        <span class="stat-value">3/8</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">支出金额</span>
        <span class="stat-value expense">¥66</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">运动时长</span>
        <span class="stat-value">30分钟</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickActions',
  data() {
    return {
      actions: [
        {
          id: 1,
          label: '记账',
          icon: 'el-icon-coin',
          color: '#f39c12',
          route: '/finance'
        },
        {
          id: 2,
          label: '新任务',
          icon: 'el-icon-plus',
          color: '#1abc9c',
          action: 'addTask'
        },
        {
          id: 3,
          label: '健康',
          icon: 'el-icon-star-on',
          color: '#e74c3c',
          action: 'addHealth'
        },
        {
          id: 4,
          label: '笔记',
          icon: 'el-icon-edit-outline',
          color: '#9b59b6',
          action: 'addNote'
        }
      ]
    }
  },
  methods: {
    handleAction(action) {
      if (action.route) {
        // 路由跳转
        this.$router.push(action.route)
      } else if (action.action) {
        // 执行特定操作
        this[action.action]()
      }
    },

    addTask() {
      this.$prompt('请输入任务内容', '添加新任务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：完成项目报告'
      }).then(({ value }) => {
        if (value) {
          this.$message({
            type: 'success',
            message: `任务 "${value}" 已添加`
          })
          // 这里可以调用API保存任务
        }
      }).catch(() => {
        // 取消操作
      })
    },

    addHealth() {
      this.$prompt('请输入今日体重（kg）', '记录健康数据', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：65.5',
        inputPattern: /^\d+(\.\d+)?$/,
        inputErrorMessage: '请输入有效的数字'
      }).then(({ value }) => {
        if (value) {
          this.$message({
            type: 'success',
            message: `体重记录已保存：${value}kg`
          })
          // 这里可以调用API保存健康数据
        }
      }).catch(() => {
        // 取消操作
      })
    },

    addNote() {
      this.$prompt('请输入笔记内容', '快速笔记', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '记录你的想法...'
      }).then(({ value }) => {
        if (value) {
          this.$message({
            type: 'success',
            message: '笔记已保存'
          })
          // 这里可以调用API保存笔记
        }
      }).catch(() => {
        // 取消操作
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-actions {
  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 8px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;
      background-color: #f8f9fa;

      &:hover {
        background-color: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .action-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        transition: all 0.3s ease;

        i {
          color: white;
          font-size: 18px;
        }
      }

      .action-label {
        font-size: 13px;
        color: #2c3e50;
        font-weight: 500;
        text-align: center;
      }

      &:hover .action-icon {
        transform: scale(1.1);
      }
    }
  }

  .stats-section {
    border-top: 1px solid #e9ecef;
    padding-top: 16px;

    h5 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px 0;

      .stat-label {
        font-size: 12px;
        color: #6c757d;
      }

      .stat-value {
        font-size: 13px;
        font-weight: 600;
        color: #2c3e50;

        &.expense {
          color: #e74c3c;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .quick-actions {
    .action-grid {
      .action-item {
        padding: 12px 6px;

        .action-icon {
          width: 36px;
          height: 36px;

          i {
            font-size: 16px;
          }
        }

        .action-label {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
