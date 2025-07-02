<template>
  <div class="finance-settings">
    <div class="page-header">
      <h2>分类设置</h2>
      <p>管理收入和支出的分类设置</p>
    </div>

    <div class="coming-soon">
      <i class="el-icon-setting" />
      <h3>分类设置功能开发中</h3>
      <p>这个功能正在开发中，敬请期待</p>
      <p>将包含：自定义分类、分类图标设置、分类排序等功能</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinanceSettings'
}
</script>

<style lang="scss" scoped>
.finance-settings {
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

  .coming-soon {
    background: white;
    border-radius: 12px;
    padding: 80px;
    text-align: center;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);

    i {
      font-size: 64px;
      color: #409eff;
      margin-bottom: 24px;
    }

    h3 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      margin: 8px 0;
      color: #8c92a4;
      font-size: 16px;
    }
  }
}
</style>
