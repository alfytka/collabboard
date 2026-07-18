<script setup lang="ts">
import type { Card, List } from '../types';
import CardItem from './CardItem.vue';
import CreateCardForm from './CreateCardForm.vue';

defineProps<{
  list: List;
  cards: Card[];
}>();
</script>

<template>
  <div class="shrink-0 w-72 bg-gray-100 rounded-lg p-3">
    <h3 class="font-semibold text-gray-700 mb-3 px-1">{{ list.title }}</h3>

    <div class="flex flex-col gap-2 mb-3">
      <CardItem v-for="card in cards" :key="card.id" :card="card" />
    </div>

    <CreateCardForm :list-id="list.id" />
  </div>
</template>