<script setup lang="ts">
import { ref } from 'vue';
import { useListStore } from '../stores/list.store';

const props = defineProps<{ boardId: string }>();
const listStore = useListStore();
const title = ref('');
const isOpen = ref(false);

async function handleSubmit() {
  if (!title.value.trim()) return;
  await listStore.createList(props.boardId, title.value);
  title.value = '';
  isOpen.value = false;
}
</script>

<template>
  <div class="shrink-0 w-72">
    <form v-if="isOpen" class="bg-gray-100 rounded-lg p-3 flex flex-col gap-2" @submit.prevent="handleSubmit">
      <input
        v-model="title"
        type="text"
        placeholder="Nama list..."
        class="border border-gray-300 rounded-md px-3 py-2 text-sm"
        autofocus
      />
      <div class="flex gap-2">
        <button type="submit" class="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
          Tambah
        </button>
        <button type="button" class="px-3 py-1.5 text-gray-500 text-sm" @click="isOpen = false">
          Batal
        </button>
      </div>
    </form>
    <button
      v-else
      class="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
      @click="isOpen = true"
    >
      Tambah list
    </button>
  </div>
</template>