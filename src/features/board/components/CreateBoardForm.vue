<script setup lang="ts">
import { ref } from 'vue';
import { useBoardStore } from '../stores/board.store';

const props = defineProps<{
  workspaceId: string;
}>();

const boardStore = useBoardStore();
const title = ref('');
const titleRef = ref<HTMLInputElement | null>(null);

async function handleSubmit() {
  if (!title.value.trim()) {
    titleRef.value?.focus();
    return;
  }
  await boardStore.createBoard(props.workspaceId, title.value);
  title.value = '';
}
</script>

<template>
  <form class="flex gap-2" @submit.prevent="handleSubmit">
    <input
      ref="titleRef"
      v-model="title"
      type="text"
      placeholder="Nama board baru..."
      class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400"
    />
    <button
      type="submit"
      :disabled="boardStore.creating"
      class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
    >
      {{ boardStore.creating ? 'Memuat...' : 'Buat Board' }}
    </button>
  </form>
</template>