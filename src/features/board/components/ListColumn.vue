<script setup lang="ts">
import { calculatePosition } from '@/shared/utils/position.ts';
import { useCardStore } from '../stores/card.store.ts';
import type { Card, List } from '../types';
import CardItem from './CardItem.vue';
import CreateCardForm from './CreateCardForm.vue';
import draggable from 'vuedraggable';

const props = defineProps<{
  list: List;
  cards: Card[];
}>();

const cardStore = useCardStore();

// vuedraggable butuh v-model, tapi kita tidak mau langsung mutate props.
// Handler ini dipanggil setelah drag selesai, dengan detail perpindahan.
function handleCardMove(event: any) {
  // event dari SortableJS: { added } atau { moved } tergantung jenis perubahan
  if (event.added) {
    const { element, newIndex } = event.added;
    const siblingsCards = props.cards; // urutan cards di list tujuan, sebelum item baru masuk
    const prevCard = siblingsCards[newIndex - 1];
    const nextCard = siblingsCards[newIndex];
    const newPosition = calculatePosition(
      prevCard?.position ?? null,
      nextCard?.position ?? null,
    );
    cardStore.moveCard(element.id, props.list.id, newPosition);
  }

  if (event.moved) {
    const { element, newIndex } = event.moved;
    const siblingsCards = props.cards.filter((c) => c.id !== element.id);
    const prevCard = siblingsCards[newIndex - 1];
    const nextCard = siblingsCards[newIndex];
    const newPosition = calculatePosition(
      prevCard?.position ?? null,
      nextCard?.position ?? null,
    );
    cardStore.moveCard(element.id, props.list.id, newPosition);
  }
}
</script>

<template>
  <div class="shrink-0 w-72 bg-gray-100 rounded-lg p-3">
    <h3 class="list-drag-handle font-semibold text-gray-700 mb-3 px-1">
      {{ list.title }}
    </h3>

    <draggable
      :model-value="cards"
      item-key="id"
      group="cards"
      class="flex flex-col gap-2 mb-3 min-h-5"
      ghost-class="opacity-40"
      @change="handleCardMove"
    >
      <template #item="{ element }">
        <CardItem :card="element" />
      </template>
    </draggable>

    <CreateCardForm :list-id="list.id" />
  </div>
</template>