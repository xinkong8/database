<template>
  <li class="todo" :class="{ completed: todo.done, editing: editing }">
    <div class="view">
      <input class="toggle" type="checkbox" :checked="todo.done" @change="toggleTodo(todo)">
      <label @dblclick="editing = true">
        <span class="todo-text">{{ todo.text }}</span>
        <div v-if="showMeta" class="todo-meta">
          <span v-if="todo.priority && todo.priority !== 'medium'" class="priority-badge" :class="priorityClass">
            {{ priorityLabel }}
          </span>
          <span v-if="todo.dueDate" class="due-date" :class="{ overdue: isOverdue }">
            {{ formatDate(todo.dueDate) }}
          </span>
        </div>
      </label>
      <button class="destroy" @click="deleteTodo(todo)" />
    </div>
    <input
      v-show="editing"
      ref="input"
      class="edit"
      type="text"
      :value="todo.text"
      @keyup.enter="doneEdit"
      @keyup.esc="cancelEdit"
      @blur="doneEdit"
    >
  </li>
</template>

<script>
export default {
  name: 'Todo',
  directives: {
    focus: {
      inserted: function(el) {
        el.focus()
      }
    }
  },
  props: {
    todo: {
      type: Object,
      required: true
    },
    showMeta: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      editing: false
    }
  },
  computed: {
    priorityClass() {
      return `priority-${this.todo.priority}`
    },
    priorityLabel() {
      const labels = {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急'
      }
      return labels[this.todo.priority] || this.todo.priority
    },
    isOverdue() {
      if (!this.todo.dueDate) return false
      return new Date(this.todo.dueDate) < new Date()
    }
  },
  methods: {
    toggleTodo(todo) {
      this.$emit('toggleTodo', todo)
    },
    deleteTodo(todo) {
      this.$emit('deleteTodo', todo)
    },
    doneEdit(e) {
      const value = e.target.value.trim()
      const { todo } = this
      if (!value) {
        this.deleteTodo(todo)
      } else if (this.editing) {
        this.$emit('editTodo', {
          todo,
          value
        })
        this.editing = false
      }
    },
    cancelEdit() {
      this.editing = false
    },
    formatDate(date) {
      if (!date) return ''
      const today = new Date()
      const targetDate = new Date(date)
      const diffTime = targetDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '明天'
      if (diffDays === -1) return '昨天'
      if (diffDays > 0) return `${diffDays}天后`
      return `${Math.abs(diffDays)}天前`
    }
  }
}
</script>

<style lang="scss" scoped>
.todo {
  position: relative;
  font-size: 24px;
  border-bottom: 1px solid #ededed;

  &:last-child {
    border-bottom: none;
  }

  &.editing {
    border-bottom: none;
    padding: 0;

    &:last-child {
      margin-bottom: -1px;
    }

    .edit {
      display: block;
      width: calc(100% - 43px);
      padding: 12px 16px;
      margin: 0 0 0 43px;
    }

    .view {
      display: none;
    }
  }

  &.completed {
    .todo-text {
      color: #d9d9d9;
      text-decoration: line-through;
    }
  }
}

.toggle {
  text-align: center;
  width: 40px;
  /* auto, since non-WebKit browsers doesn't support input styling */
  height: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  border: none; /* Mobile Safari */
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;

  &:after {
    content: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23ededed%22%20stroke-width%3D%223%22/%3E%3C/svg%3E');
  }

  &:checked:after {
    content: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23bddad5%22%20stroke-width%3D%223%22/%3E%3Cpath%20fill%3D%22%235dc2af%22%20d%3D%22M72%2025L42%2071%2027%2056l-4%204%2020%2020%2034-52z%22/%3E%3C/svg%3E');
  }
}

.view {
  position: relative;

  label {
    display: block;
    line-height: 1.2;
    padding: 15px 60px 15px 15px;
    margin-left: 45px;
    cursor: pointer;

    .todo-text {
      word-break: break-all;
      display: block;
      line-height: 1.4;
      transition: color 0.4s;
      font-weight: 400;
      color: #4d4d4d;
      font-size: 16px;
    }

    .todo-meta {
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 8px;

      .priority-badge {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        color: white;

        &.priority-low {
          background-color: #909399;
        }

        &.priority-high {
          background-color: #E6A23C;
        }

        &.priority-urgent {
          background-color: #F56C6C;
        }
      }

      .due-date {
        font-size: 12px;
        color: #909399;

        &.overdue {
          color: #F56C6C;
          font-weight: 500;
        }
      }
    }
  }
}

.destroy {
  display: none;
  position: absolute;
  top: 0;
  right: 10px;
  bottom: 0;
  width: 40px;
  height: 40px;
  margin: auto 0;
  font-size: 30px;
  color: #cc9a9a;
  margin-bottom: 11px;
  transition: color 0.2s ease-out;
  cursor: pointer;
  background: none;
  border: none;

  &:hover {
    color: #af5b5e;
  }

  &:after {
    content: '×';
  }
}

.todo:hover .destroy {
  display: block;
}

.edit {
  position: relative;
  margin: 0;
  width: 100%;
  font-size: 24px;
  font-family: inherit;
  font-weight: inherit;
  line-height: 1.4em;
  color: inherit;
  padding: 6px;
  border: 1px solid #999;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
