<template>
  <div class="components-container board">
    <Kanban :key="1" :list="list1" :group="group" class="kanban todo" header-text="待办" />
    <Kanban :key="2" :list="list2" :group="group" class="kanban working" header-text="进行中" />
    <Kanban :key="3" :list="list3" :group="group" class="kanban done" header-text="已完成" />
  </div>
</template>
<script>
import Kanban from '@/components/Kanban'

export default {
  name: 'DragKanbanDemo',
  components: {
    Kanban
  },
  data() {
    return {
      group: 'mission',
      list1: [
        { name: '任务', id: 1 },
        { name: '任务', id: 2 },
        { name: '任务', id: 3 },
        { name: '任务', id: 4 }
      ],
      list2: [
        { name: '任务', id: 5 },
        { name: '任务', id: 6 },
        { name: '任务', id: 7 }
      ],
      list3: [
        { name: '任务', id: 8 },
        { name: '任务', id: 9 },
        { name: '任务', id: 10 }
      ]
    }
  }
}
</script>
<style lang="scss">
.board {
  width: 1000px;
  margin-left: 20px;
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  align-items: flex-start;
}
.kanban {
  &.todo {
    .board-column-header {
      background: #4A9FF9;
    }
  }
  &.working {
    .board-column-header {
      background: #f9944a;
    }
  }
  &.done {
    .board-column-header {
      background: #2ac06d;
    }
  }
}
</style>

