
<template>
  <div class="recent-transactions">
    <el-table :data="transactions" style="width: 100%;" size="small">
      <el-table-column label="类型" width="80" align="center">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.type === 'income' ? 'success' : 'danger'"
            size="small"
          >
            {{ scope.row.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="120">
        <template slot-scope="scope">
          <div class="transaction-item">
            <i :class="scope.row.icon" class="transaction-icon" />
            <span>{{ scope.row.description }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100" align="right">
        <template slot-scope="scope">
          <span :class="scope.row.type === 'income' ? 'income-amount' : 'expense-amount'">
            {{ scope.row.type === 'income' ? '+' : '-' }}¥{{ scope.row.amount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="80" align="center">
        <template slot-scope="scope">
          <span class="transaction-date">{{ scope.row.date }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="transaction-footer">
      <el-button type="text" size="small" @click="viewAll">
        查看全部记录 <i class="el-icon-arrow-right" />
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecentTransactions',
  data() {
    return {
      transactions: [
        {
          id: 1,
          type: 'expense',
          description: '午餐',
          amount: 35,
          icon: 'el-icon-food',
          date: '今天',
          category: '餐饮'
        },
        {
          id: 2,
          type: 'income',
          description: '工资',
          amount: 8000,
          icon: 'el-icon-coin',
          date: '昨天',
          category: '收入'
        },
        {
          id: 3,
          type: 'expense',
          description: '地铁票',
          amount: 6,
          icon: 'el-icon-truck',
          date: '昨天',
          category: '交通'
        },
        {
          id: 4,
          type: 'expense',
          description: '咖啡',
          amount: 25,
          icon: 'el-icon-coffee-cup',
          date: '前天',
          category: '餐饮'
        },
        {
          id: 5,
          type: 'expense',
          description: '电影票',
          amount: 45,
          icon: 'el-icon-video-camera',
          date: '前天',
          category: '娱乐'
        }
      ]
    }
  },
  methods: {
    viewAll() {
      // 跳转到财务管理页面
      this.$router.push('/finance')
    }
  }
}
</script>

<style lang="scss" scoped>
.recent-transactions {
  .transaction-item {
    display: flex;
    align-items: center;

    .transaction-icon {
      margin-right: 8px;
      color: #409eff;
      font-size: 16px;
    }
  }

  .income-amount {
    color: #67c23a;
    font-weight: 600;
  }

  .expense-amount {
    color: #f56c6c;
    font-weight: 600;
  }

  .transaction-date {
    font-size: 12px;
    color: #909399;
  }

  .transaction-footer {
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
    margin-top: 16px;
  }
}

// 覆盖table样式，使其更紧凑
::v-deep .el-table {
  .el-table__header {
    th {
      background-color: #fafafa;
      color: #666;
      font-weight: 500;
      font-size: 12px;
    }
  }

  .el-table__body {
    tr:hover {
      background-color: #f8f9fa;
    }

    td {
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
    }
  }
}
</style>
