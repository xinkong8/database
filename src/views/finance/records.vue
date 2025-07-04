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
              :key="category"
              :label="category"
              :value="category"
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
            <el-tag :type="scope.row.recordType === 'income' ? 'success' : 'danger'" size="small">
              {{ scope.row.recordType === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="120" />

        <el-table-column prop="amount" label="金额" width="120" align="right" sortable>
          <template slot-scope="scope">
            <span :class="scope.row.recordType === 'income' ? 'positive' : 'negative'">
              {{ scope.row.recordType === 'income' ? '+' : '-' }}{{ scope.row.amount | money }}
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
      if (typeof val !== 'number' || isNaN(val)) return '¥0.00'
      return val.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
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
      const categories = new Set()
      this.allRecords.forEach(record => {
        if (record.category) {
          categories.add(record.category)
        }
      })
      return Array.from(categories).sort()
    },

    paginatedRecords() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredRecords.slice(start, end)
    },

    totalIncome() {
      return this.filteredRecords
        .filter(r => r.recordType === 'income')
        .reduce((sum, r) => sum + Number(r.amount), 0)
    },

    totalExpense() {
      return this.filteredRecords
        .filter(r => r.recordType === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0)
    },

    netBalance() {
      return this.totalIncome - this.totalExpense
    }
  },
  created() {
    this.loadRecords()
  },
  methods: {
    loadRecords() {
      const incomeList = JSON.parse(localStorage.getItem('incomeList') || '[]')
        .map(item => ({
          ...item,
          recordType: 'income',
          id: `income_${item.date}_${item.amount}_${Math.random()}`,
          category: item.type || '其他',
          description: item.remark || ''
        }))

      const expenseList = JSON.parse(localStorage.getItem('expenseList') || '[]')
        .map(item => ({
          ...item,
          recordType: 'expense',
          id: `expense_${item.date}_${item.amount}_${Math.random()}`,
          category: item.type || '其他',
          description: item.remark || ''
        }))

      this.allRecords = [...incomeList, ...expenseList]
        .filter(item => item.date && item.amount)
        .sort((a, b) => new Date(b.date) - new Date(a.date))

      this.filteredRecords = [...this.allRecords]
    },

    handleSearch() {
      this.filteredRecords = this.allRecords.filter(record => {
        // 类型筛选
        if (this.searchForm.type && record.recordType !== this.searchForm.type) {
          return false
        }

        // 分类筛选
        if (this.searchForm.category && record.category !== this.searchForm.category) {
          return false
        }

        // 日期范围筛选
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          const recordDate = new Date(record.date)
          const startDate = new Date(this.searchForm.dateRange[0])
          const endDate = new Date(this.searchForm.dateRange[1])
          if (recordDate < startDate || recordDate > endDate) {
            return false
          }
        }

        // 金额范围筛选
        const amount = Number(record.amount)
        if (this.searchForm.minAmount && amount < Number(this.searchForm.minAmount)) {
          return false
        }
        if (this.searchForm.maxAmount && amount > Number(this.searchForm.maxAmount)) {
          return false
        }

        return true
      })

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
      this.filteredRecords = [...this.allRecords]
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

        const storageKey = record.recordType === 'income' ? 'incomeList' : 'expenseList'
        const records = JSON.parse(localStorage.getItem(storageKey) || '[]')

        const updatedRecords = records.filter(r =>
          !(r.date === record.date &&
            r.amount === record.amount &&
            r.type === record.category)
        )

        localStorage.setItem(storageKey, JSON.stringify(updatedRecords))
        this.loadRecords()
        this.handleSearch()
        this.$message.success('记录删除成功')
      } catch (error) {
        // 用户取消删除
      }
    },

    handleEditSuccess() {
      this.loadRecords()
      this.handleSearch()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
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
