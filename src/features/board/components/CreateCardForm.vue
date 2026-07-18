<script setup lang="ts">
import { ref } from 'vue';
import { useCardStore } from '../stores/card.store';

const props = defineProps<{ listId: string }>();
const cardStore = useCardStore();
const title = ref('');
const isOpen = ref(false);

async function handleSubmit() {
  if (!title.value.trim()) return;
  await cardStore.createCard(props.listId, title.value);
  title.value = '';
  isOpen.value = false;
}
</script>

<template>
  <form v-if="isOpen" class="flex flex-col gap-2" @submit.prevent="handleSubmit">
    <input
      v-model="title"
      type="text"
      placeholder="Nama card..."
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
    class="w-full text-left px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-200 rounded-md"
    @click="isOpen = true"
  >
    Tambah card
  </button>
</template>