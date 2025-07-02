<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <h4 class="todo-title">待办事项</h4>
      <input
        v-model="newTodoText"
        class="new-todo"
        autocomplete="off"
        placeholder="添加新的待办事项..."
        @keyup.enter="addTodo"
      >
    </header>

    <!-- main section -->
    <section v-show="todos.length" class="main">
      <div class="todo-stats">
        <span class="stat-item">
          <span class="stat-number">{{ remaining }}</span>
          <span class="stat-label">待完成</span>
        </span>
        <span class="stat-item">
          <span class="stat-number">{{ completed }}</span>
          <span class="stat-label">已完成</span>
        </span>
      </div>

      <ul class="todo-list">
        <todo
          v-for="(todo, index) in filteredTodos.slice(0, 5)"
          :key="index"
          :todo="todo"
          @toggleTodo="toggleTodo"
          @editTodo="editTodo"
          @deleteTodo="deleteTodo"
        />
      </ul>

      <div v-if="todos.length > 5" class="more-todos">
        还有 {{ todos.length - 5 }} 项待办事项...
      </div>
    </section>

    <!-- empty state -->
    <div v-if="!todos.length" class="empty-state">
      <svg-icon icon-class="list" class="empty-icon" />
      <p>暂无待办事项</p>
      <p class="empty-tip">添加第一个待办事项开始管理生活吧！</p>
    </div>

    <!-- footer -->
    <footer v-show="todos.length" class="footer">
      <ul class="filters">
        <li v-for="(val, key) in filters" :key="key">
          <a
            :class="{ selected: visibility === key }"
            @click.prevent="visibility = key"
          >
            {{ getFilterLabel(key) }}
          </a>
        </li>
      </ul>
      <button
        v-show="completed > 0"
        class="clear-completed"
        @click="clearCompleted"
      >
        清除已完成 ({{ completed }})
      </button>
    </footer>
  </section>
</template>

<script>
import Todo from './Todo.vue'

const STORAGE_KEY = 'todos'
const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}

export default {
  components: { Todo },
  data() {
    return {
      visibility: 'all',
      filters,
      todos: [],
      newTodoText: ''
    }
  },
  computed: {
    filteredTodos() {
      return filters[this.visibility](this.todos)
    },
    remaining() {
      return this.todos.filter(todo => !todo.done).length
    },
    completed() {
      return this.todos.filter(todo => todo.done).length
    }
  },
  created() {
    this.loadTodos()
  },
  methods: {
    loadTodos() {
      this.todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      // 如果没有待办事项，添加一些示例
      if (this.todos.length === 0) {
        this.todos = [
          { text: '制定本周学习计划', done: false, id: 1 },
          { text: '整理房间', done: true, id: 2 },
          { text: '阅读一小时', done: false, id: 3 },
          { text: '运动30分钟', done: false, id: 4 },
          { text: '更新个人简历', done: false, id: 5 }
        ]
        this.setLocalStorage()
      }
    },

    setLocalStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos))
    },

    addTodo() {
      const text = this.newTodoText.trim()
      if (text) {
        this.todos.unshift({
          text,
          done: false,
          id: Date.now()
        })
        this.setLocalStorage()
        this.newTodoText = ''
        this.$emit('refresh-data')
      }
    },

    toggleTodo(todo) {
      todo.done = !todo.done
      this.setLocalStorage()
      this.$emit('refresh-data')
    },

    deleteTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
      this.setLocalStorage()
      this.$emit('refresh-data')
    },

    editTodo({ todo, value }) {
      todo.text = value
      this.setLocalStorage()
    },

    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.done)
      this.setLocalStorage()
      this.$emit('refresh-data')
    },

    getFilterLabel(key) {
      const labels = {
        all: '全部',
        active: '进行中',
        completed: '已完成'
      }
      return labels[key] || key
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';

.todoapp {
  .todo-title {
    margin: 0 0 16px 0;
    color: #2c3e50;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
  }

  .todo-stats {
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 16px;

    .stat-item {
      text-align: center;

      .stat-number {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #409EFF;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #909399;

    .empty-icon {
      font-size: 48px;
      color: #C0C4CC;
      margin-bottom: 16px;
    }

    p {
      margin: 8px 0;

      &.empty-tip {
        font-size: 12px;
        color: #C0C4CC;
      }
    }
  }

  .more-todos {
    text-align: center;
    padding: 12px;
    color: #909399;
    font-size: 12px;
    background: #f8f9fa;
    border-radius: 4px;
    margin-top: 8px;
  }

  .new-todo {
    background: #f8f9fa;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
      border-color: #409EFF;
      outline: none;
    }

    &::placeholder {
      color: #C0C4CC;
    }
  }

  .footer {
    padding: 16px 0 0 0;
    border-top: 1px solid #ededed;

    .filters {
      margin: 0 0 12px 0;
      padding: 0;
      list-style: none;
      display: flex;
      justify-content: center;
      gap: 16px;

      a {
        color: #666;
        text-decoration: none;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background: #f5f5f5;
        }

        &.selected {
          background: #409EFF;
          color: white;
        }
      }
    }

    .clear-completed {
      display: block;
      margin: 0 auto;
      padding: 6px 12px;
      background: #F56C6C;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: #f02d2d;
      }
    }
  }
}
</style>
