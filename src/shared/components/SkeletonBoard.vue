<script setup lang="ts">
import SkeletonCard from './SkeletonCard.vue'
</script>

<template>
  <div class="flex gap-4 p-6">
    <div v-for="i in 3" :key="i" class="shrink-0 w-72 bg-gray-50 rounded-lg p-3">
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
      <div class="flex flex-col gap-2">
        <SkeletonCard v-for="j in 2" :key="j" />
      </div>
    </div>
  </div>
</template>