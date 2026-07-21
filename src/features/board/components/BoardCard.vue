<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Board } from '../types';
import BoardCardMenu from './BoardCardMenu.vue';

defineProps<{
  board: Board;
  isEditing: boolean;
  isMenuOpen: boolean;
}>();

const emit = defineEmits<{
  toggleMenu: [];
  closeMenu: [];
  startEdit: [];
  requestDelete: [];
}>();
</script>

<template>
  <!-- Edit mode -->
  <div v-if="isEditing" class="border border-blue-300 rounded-lg px-4 pt-4 pb-1">
    <slot name="edit-form" />
  </div>

  <!-- Normal mode -->
  <RouterLink
    v-else
    :to="{ name: 'board', params: { boardId: board.id } }"
    class="block border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition"
  >
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-gray-800">{{ board.title }}</h3>
        <p class="text-xs text-gray-400 mt-1">
          Dibuat {{ new Date(board.created_at).toLocaleDateString('id-ID') }}
        </p>
      </div>
      <BoardCardMenu
        :open="isMenuOpen"
        @toggle="emit('toggleMenu')"
        @close="emit('closeMenu')"
        @rename="emit('startEdit')"
        @delete="emit('requestDelete')"
      />
    </div>
  </RouterLink>
</template>