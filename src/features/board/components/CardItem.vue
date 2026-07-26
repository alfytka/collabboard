<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '../types';
import { getAvatarColor } from '@/shared/utils/avatar';

const props = defineProps<{ card: Card }>();
const emit = defineEmits<{ click: [] }>();

const accentColor = computed(() => getAvatarColor(props.card.id));

const dueDateInfo = computed(() => {
  if (!props.card.due_date) return null;
  const due = new Date(props.card.due_date);
  const now = new Date();
  const isOverdue = due < now;
  return {
    label: due.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    }),
    isOverdue,
  }
});
</script>

<template>
  <div
    class="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150 cursor-pointer overflow-hidden"
    @click="emit('click')"
  >
    <div class="h-1" :class="accentColor" />

    <div class="p-3">
      <p class="text-sm text-gray-800 leading-snug">{{ card.title }}</p>

      <div v-if="dueDateInfo || card.description" class="flex items-center gap-2 mt-2.5">
        <span
          v-if="dueDateInfo"
          class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
          :class="dueDateInfo.isOverdue
            ? 'bg-red-50 text-red-600'
            : 'bg-gray-100 text-gray-500'"
        >
          📅 {{ dueDateInfo.label }}
        </span>

        <span v-if="card.description" class="text-gray-400" title="Add deskripsi">
          📝
        </span>
      </div>
    </div>
  </div>
</template>