<script setup lang="ts">
import type { Card } from '../types';

defineProps<{ card: Card }>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <div
    class="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
    @click="emit('click')"
  >
    <p class="text-sm text-gray-800">{{ card.title }}</p>
    <p v-if="card.due_date" class="text-xs text-gray-400 mt-1">
      {{ new Date(card.due_date).toLocaleDateString('id-ID') }}
    </p>
  </div>
</template>