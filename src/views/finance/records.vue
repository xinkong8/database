<template>
  <div class="finance-records">
    <div class="page-header">
      <h2>记录管理</h2>
      <p>查看和管理您的所有财务记录</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filters">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable filterable>
            <el-option
              v-for="category in allCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="金额">
          <el-input v-model="searchForm.minAmount" placeholder="最小金额" type="number" style="width: 120px" />
          <span style="margin: 0 8px;">-</span>
          <el-input v-model="searchForm.maxAmount" placeholder="最大金额" type="number" style="width: 120px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计信息 -->
    <div class="summary-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">总记录数</div>
            <div class="stat-value">{{ filteredRecords.length }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">总收入</div>
            <div class="stat-value positive">{{ totalIncome | money }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">总支出</div>
            <div class="stat-value negative">{{ totalExpense | money }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">净结余</div>
            <div class="stat-value" :class="netBalance >= 0 ? 'positive' : 'negative'">
              {{ netBalance | money }}
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 记录列表 -->
    <div class="records-table">
      <el-table
        :data="paginatedRecords"
        style="width: 100%"
        :default-sort="{prop: 'date', order: 'descending'}"
      >
        <el-table-column prop="date" label="日期" width="120" sortable />

        <el-table-column label="类型" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'" size="small">
              {{ scope.row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="120">
          <template slot-scope="scope">
            {{ getCategoryName(scope.row.categoryId) }}
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="金额" width="120" align="right" sortable>
          <template slot-scope="scope">
            <span :class="scope.row.type === 'income' ? 'positive' : 'negative'">
              {{ scope.row.type === 'income' ? '+' : '-' }}{{ scope.row.amount | money }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="备注" />

        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="editRecord(scope.row)">
              编辑
            </el-button>
            <el-button type="text" size="small" class="danger-text" @click="deleteRecord(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRecords.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 编辑记录弹窗 -->
    <edit-record-dialog
      :visible.sync="editDialogVisible"
      :record="editingRecord"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script>
import EditRecordDialog from './components/EditRecordDialog'

export default {
  name: 'FinanceRecords',
  components: {
    EditRecordDialog
  },
  filters: {
    money(val) {
      // 处理字符串和数字格式的金额
      const num = typeof val === 'string' ? parseFloat(val) : val
      if (typeof num !== 'number' || isNaN(num)) return '¥0.00'
      return num.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
    }
  },
  data() {
    return {
      searchForm: {
        type: '',
        category: '',
        dateRange: [],
        minAmount: '',
        maxAmount: ''
      },
      allRecords: [],
      filteredRecords: [],
      currentPage: 1,
      pageSize: 20,
      editDialogVisible: false,
      editingRecord: null
    }
  },
  computed: {
    allCategories() {
      return this.$store.state.finance.categories.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
    },

    paginatedRecords() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredRecords.slice(start, end)
    },

    totalIncome() {
      return this.$store.getters['finance/totalIncome']
    },

    totalExpense() {
      return this.$store.getters['finance/totalExpense']
    },

    netBalance() {
      return this.$store.getters['finance/netBalance']
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        await Promise.all([
          this.$store.dispatch('finance/fetchRecords'),
          this.$store.dispatch('finance/fetchCategories')
        ])
        this.allRecords = this.$store.getters['finance/filteredRecords']
        this.filteredRecords = [...this.allRecords]
      } catch (error) {
        this.$message.error('数据加载失败')
        console.error(error)
      }
    },

    handleSearch() {
      // 设置store中的筛选条件
      this.$store.dispatch('finance/setFilters', {
        type: this.searchForm.type,
        category: this.searchForm.category,
        dateRange: this.searchForm.dateRange,
        minAmount: this.searchForm.minAmount,
        maxAmount: this.searchForm.maxAmount
      })

      // 获取筛选后的结果
      this.filteredRecords = this.$store.getters['finance/filteredRecords']
      this.currentPage = 1
    },

    resetSearch() {
      this.searchForm = {
        type: '',
        category: '',
        dateRange: [],
        minAmount: '',
        maxAmount: ''
      }
      this.$store.dispatch('finance/resetFilters')
      this.filteredRecords = this.$store.getters['finance/filteredRecords']
      this.currentPage = 1
    },

    editRecord(record) {
      this.editingRecord = { ...record }
      this.editDialogVisible = true
    },

    async deleteRecord(record) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.$store.dispatch('finance/deleteRecord', record.id)
        this.$message.success('记录删除成功')
        await this.loadData()
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        }
        // 用户取消删除时error没有message
      }
    },

    async handleEditSuccess() {
      await this.loadData()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },

    getCategoryName(categoryId) {
      const category = this.$store.getters['finance/categoryMap'][categoryId]
      return category ? category.name : '未分类'
    }
  }
}
</script>

<style lang="scss" scoped>
.finance-records {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);

  .page-header {
    margin-bottom: 32px;

    h2 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 28px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #8c92a4;
      font-size: 14px;
    }
  }

  .search-filters {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    .search-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .summary-stats {
    margin-bottom: 24px;

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

      .stat-label {
        font-size: 14px;
        color: #8c92a4;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
      }
    }
  }

  .records-table {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    .pagination {
      margin-top: 24px;
      text-align: right;
    }
  }

  .positive {
    color: #27ae60;
  }

  .negative {
    color: #e74c3c;
  }

  .danger-text {
    color: #e74c3c;
  }
}
</style>
