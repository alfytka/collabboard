<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Board } from '../types';

defineProps<{
  board: Board;
}>();
</script>

<template>
  <RouterLink
    :to="{ name: 'board', params: { boardId: board.id } }"
    class="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition"
  >
    <h3 class="font-semibold text-gray-800">{{ board.title }}</h3>
    <p class="text-xs text-gray-400 mt-1">
      Dibuat {{ new Date(board.created_at).toLocaleDateString('id-ID') }}
    </p>
  </RouterLink>
</template>