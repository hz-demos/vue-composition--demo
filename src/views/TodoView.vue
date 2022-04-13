<script setup lang="ts">
import { watchEffect, computed, ref } from "vue";
import { useRouter, useRoute, onBeforeRouteUpdate, type RouteLocationNormalized } from "vue-router";
import type { Todo, Todos, FilterStatus } from "@/types";

const route = useRoute();
const router = useRouter();
const STORAGE_KEY = "vue-todomvc";

const filters = {
  all: (todos: Todo[]) => todos,
  active: (todos: Todo[]) => todos.filter((todo) => !todo.completed),
  completed: (todos: Todo[]) => todos.filter((todo) => todo.completed),
};

// state
const todos = ref<Todos>(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
const visibility = ref<FilterStatus>("all");
const editedTodo = ref();

// derived state
const filteredTodos = computed(() => filters[visibility.value](todos.value));
const remaining = computed(() => filters.active(todos.value).length);

// persist state
watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value));
});

onBeforeRouteUpdate((to) => {
  onRouteChange(to);
});
onRouteChange(route);

function toggleAll(e) {
  todos.value.forEach((todo) => (todo.completed = e.target.checked));
}

function addTodo(e: KeyboardEvent) {
  const value = (e.target as HTMLInputElement).value.trim();
  if (value) {
    todos.value.push({
      id: Date.now(),
      title: value,
      completed: false,
    });
    (e.target as HTMLInputElement).value = "";
  }
}

function removeTodo(todo: Todo) {
  todos.value.splice(todos.value.indexOf(todo), 1);
}

let beforeEditCache = "";
function editTodo(todo: Todo) {
  beforeEditCache = todo.title;
  editedTodo.value = todo;
}

function cancelEdit(todo: Todo) {
  console.log(beforeEditCache);
  editedTodo.value = null;
  todo.title = beforeEditCache;
}

function doneEdit(todo: Todo) {
  console.log("doneEdit");
  if (editedTodo.value) {
    editedTodo.value = null;
    todo.title = todo.title.trim();
    if (!todo.title) removeTodo(todo);
  }
}

function removeCompleted() {
  todos.value = filters.active(todos.value);
}

function onRouteChange(route: RouteLocationNormalized) {
  const status = <FilterStatus>route.params.status;
  visibility.value = filters[status] ? status : "all";
}
</script>

<template>
  <section class="todo-app">
    <header class="todo-header">
      <h1>todos {{ visibility }}</h1>
      <input type="text" @keyup.enter="addTodo" />
    </header>
    <section class="todo-main" v-show="todos.length">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        :checked="remaining === 0"
        @change="toggleAll"
      />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          v-for="todo in filteredTodos"
          class="todo"
          :key="todo.id"
          :class="{ completed: todo.completed, editing: todo === editedTodo }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)">x</button>
          </div>
          <input
            v-if="todo === editedTodo"
            class="edit"
            type="text"
            v-model="todo.title"
            @vnode-mounted="({ el }) => el.focus()"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.escape="cancelEdit(todo)"
          />
        </li>
      </ul>
    </section>
    <footer class="todo-footer" v-show="todos.length">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        <span>{{ remaining === 1 ? "item" : "items" }} left</span>
      </span>
      <div class="filters">
        <button
          @click="router.push({ name: 'todo', params: { status: 'all' } })"
          :class="{ selected: visibility === 'all' }"
        >
          All
        </button>
        <button
          @click="router.push({ name: 'todo', params: { status: 'active' } })"
          :class="{ selected: visibility === 'active' }"
        >
          Active
        </button>
        <button
          @click="router.push({ name: 'todo', params: { status: 'completed' } })"
          :class="{ selected: visibility === 'completed' }"
        >
          Completed
        </button>
      </div>
      <button
        class="clear-completed"
        @click="removeCompleted"
        :style="{ visibility: todos.length > remaining ? 'visible' : 'hidden' }"
      >
        Clear completed
      </button>
    </footer>
  </section>
</template>

<style scoped lang="postcss">
@media (min-width: 1024px) {
  .todo-app {
    min-height: 100vh;
    padding-top: 5em;
  }
}

.todo-app {
  --app-width: 500px;
  --todo-height: 50px;
  --border-color: #e202026f;
}

.todo-header {
  display: block;
  width: min(100%, var(--app-width));
  padding: 0;
  & h1 {
    font-size: 3em;
    color: brown;
    text-align: center;
  }
}

.todo-main {
  position: relative;
  width: min(100%, var(--app-width));
  & .todo-list {
    padding: 0;
    & li {
      list-style: none;
    }
    & .todo {
      display: flex;
      height: var(--todo-height);
      & .view {
        display: flex;
        align-items: center;
        width: 100%;
        border: 1px solid var(--border-color);
        border-bottom: none;
        padding: 0 1em;
        & label {
          padding: 0 1em;
          flex: 1 1 auto;
        }
      }
      & .edit {
        outline: 2px solid var(--border-color);
        border-bottom: none;
      }
      &:last-child .view,
      &:last-child .edit {
        border-bottom: 1px solid var(--border-color);
      }
    }
    & .todo.editing {
      & .view {
        display: none;
      }
    }
  }
}

.todo-footer {
  display: flex;
  width: min(100%, var(--app-width));
  justify-content: space-between;
  & .todo-count {
    margin-right: 1em;
  }
}

.todo-app {
  & input[type="text"] {
    width: 100%;
    padding: 0 0 0 calc(1em + 1em + 13px);
    height: var(--todo-height);
    border: 1px solid var(--border-color);
  }
  & .toggle-all {
    width: 1px;
    height: 1px;
    border: none;
    opacity: 0;
    position: absolute;
    right: 100%;
    bottom: 100%;
  }
  & .toggle-all + label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: var(--todo-height);
    font-size: 0;
    position: absolute;
    top: calc(-1 * var(--todo-height));
    left: -0;
    &::before {
      content: "❯";
      display: inline-block;
      font-size: 22px;
      color: #949494;
      padding: 10px 27px 10px 27px;
      -webkit-transform: rotate(90deg);
      transform: rotate(90deg);
    }
  }
  & .toggle-all:checked + label:before {
    color: #484848;
  }
  & .filters {
    & button {
      border: none;
      background: none;
      &.selected {
        border-radius: 2px;
        border: 1px solid var(--border-color);
      }
    }
  }
}
</style>
