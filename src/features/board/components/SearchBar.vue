<script setup lang="ts">
import { ref } from 'vue';
import { useCardStore } from '../stores/card.store';

const cardStore = useCardStore();
const inputRef = ref<HTMLInputElement | null>(null);

defineExpose({
  focus: () => inputRef.value?.focus(),
});
</script>

<template>
  <div class="relative w-64">
    <input
      ref="inputRef"
      v-model="cardStore.searchQuery"
      id="search"
      type="text"
      placeholder="Cari card... (Ctrl+K)"
      class="w-full border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      v-if="cardStore.searchQuery"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      @click="cardStore.searchQuery = ''"
    >
      ✕
    </button>
  </div>
</template>