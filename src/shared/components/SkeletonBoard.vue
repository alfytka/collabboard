<script setup lang="ts">
import SkeletonCard from './SkeletonCard.vue'
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <div v-for="i in 6" :key="i" class="bg-gray-50 rounded-lg">
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
      <div class="flex flex-col gap-2">
        <SkeletonCard v-for="j in 2" :key="j" />
      </div>
    </div>
  </div>
</template>