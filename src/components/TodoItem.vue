<script setup lang="ts">
import { ref, reactive } from "vue";
type Todo = {
  title: string;
  completed: boolean;
};

defineProps<{
  todo: Todo;
}>();

const editView = ref(false);

function toggleEdit() {
  editView.value = !editView.value;
}
</script>

<template>
  <div class="todo-item">
    <input type="checkbox" :checked="todo.completed" @input="$emit('check')" />
    <div class="todo-item--content">
      <span v-if="!editView" @dblclick="toggleEdit">{{ todo.title }}</span>
      <input v-else type="text" :value="todo.title" @blur="toggleEdit" />
    </div>
    <button @click="$emit('delete')">x</button>
  </div>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  width: 20em;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  border: 1px solid #ccc;
}
.todo-item--content {
  flex: 1;
  padding: 0 0.5em;
}
</style>
