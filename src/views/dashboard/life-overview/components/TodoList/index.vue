<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <input
        v-model="newTodoText"
        class="new-todo"
        autocomplete="off"
        placeholder="待办事项"
        @keyup.enter="addTodo"
      >
    </header>
    <!-- main section -->
    <section v-show="todayTodos.length" class="main">
      <input
        id="toggle-all"
        :checked="allChecked"
        class="toggle-all"
        type="checkbox"
        @change="toggleAll(!allChecked)"
      >
      <label for="toggle-all" />
      <ul class="todo-list">
        <todo
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          @toggleTodo="toggleTodo"
          @editTodo="editTodo"
          @deleteTodo="deleteTodo"
        />
      </ul>
    </section>
    <!-- footer -->
    <footer v-show="todayTodos.length" class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ remaining | pluralize('项') }} 剩余
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters" :key="key">
          <a :class="{ selected: visibility === key }" @click.prevent="visibility = key">{{ key | capitalize }}</a>
        </li>
      </ul>
      <div class="footer-actions">
        <el-button type="text" size="mini" @click="goToTaskManagement">
          <i class="el-icon-right" />
          查看全部
        </el-button>
      </div>
    </footer>
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Todo from './Todo.vue'

const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}

export default {
  components: { Todo },
  filters: {
    pluralize: (n, w) => n === 1 ? w : w + 's',
    capitalize: s => s.charAt(0).toUpperCase() + s.slice(1)
  },
  data() {
    return {
      visibility: 'all',
      filters,
      newTodoText: ''
    }
  },
  computed: {
    ...mapGetters([
      'todayTodos'
    ]),
    allChecked() {
      return this.todayTodos.length > 0 && this.todayTodos.every(todo => todo.done)
    },
    filteredTodos() {
      return filters[this.visibility](this.todayTodos)
    },
    remaining() {
      return this.todayTodos.filter(todo => !todo.done).length
    }
  },
  methods: {
    ...mapActions('task', {
      addTodoAction: 'addTodo',
      updateTodoAction: 'updateTodo',
      deleteTodoAction: 'deleteTodo',
      toggleTodoAction: 'toggleTodo'
    }),
    async addTodo() {
      const text = this.newTodoText.trim()
      if (!text) return
      try {
        await this.addTodoAction({
          text,
          priority: 'medium',
          category: 1, // 默认分类：个人
          project: null,
          dueDate: new Date().toISOString().split('T')[0] // 今天的日期
        })
        this.newTodoText = ''
      } catch (error) {
        console.error('添加待办事项失败:', error)
      }
    },
    async toggleTodo(todo) {
      try {
        await this.toggleTodoAction(todo.id)
      } catch (error) {
        console.error('切换待办事项状态失败:', error)
      }
    },
    async deleteTodo(todo) {
      try {
        await this.deleteTodoAction(todo.id)
      } catch (error) {
        console.error('删除待办事项失败:', error)
      }
    },
    async editTodo({ todo, value }) {
      try {
        await this.updateTodoAction({
          id: todo.id,
          updates: { text: value }
        })
      } catch (error) {
        console.error('编辑待办事项失败:', error)
      }
    },
    async toggleAll(done) {
      try {
        for (const todo of this.todayTodos) {
          if (todo.done !== done) {
            await this.toggleTodo(todo.id)
          }
        }
      } catch (error) {
        console.error('批量切换待办事项状态失败:', error)
      }
    },
    goToTaskManagement() {
      this.$router.push('/task/overview')
    }
  }
}
</script>

<style lang="scss" scoped>
/* 让待办列表整体在父级卡片(section-wrapper)中更贴合 */
.todoapp {
  /* 撑满父容器宽度 */
  width: 100%;
  max-width: 100%;
  margin: 0; /* 去除居中间距 */

  /* 去掉外层阴影，沿用父级卡片阴影 */
  box-shadow: none;
  background: transparent; /* 使用父级背景色 */

  /* 让 Todo 区域在父卡片中纵向铺满 */
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto; /* 作为父级flex子项占据剩余高度 */

  /* 让输入框更紧凑 */
  .new-todo {
    padding: 6px 12px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    background: #fff;
  }

  /* 主体列表区域可滚动且占据剩余高度 */
  .main {
    flex: 1 1 auto;
    overflow-y: auto;
  }

  /* 隐藏批量切换的下拉箭头，避免占位 */
  .toggle-all + label {
    display: none;
  }

  /* 调整底部信息区域间距 */
  .footer {
    padding: 8px 0 0;
    border-top: none;

    /* 让 footer 固定在底部 */
    margin-top: auto;

    .todo-count {
      float: none;
    }
  }
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
<style lang="scss">
  @import './index.scss';
</style>

