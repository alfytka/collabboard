<script setup lang="ts">
import { calculatePosition } from '@/shared/utils/position.ts';
import { useCardStore } from '../stores/card.store.ts';
import type { Card, List } from '../types';
import CardItem from './CardItem.vue';
import CreateCardForm from './CreateCardForm.vue';
import draggable from 'vuedraggable';
import { useListStore } from '../stores/list.store.ts';
import { ref } from 'vue';
import DeleteListModal from './DeleteListModal.vue';

const props = defineProps<{
  list: List;
  cards: Card[];
}>();

const emit = defineEmits<{ cardClick: [card: Card] }>();

const cardStore = useCardStore();
const listStore = useListStore();

const showDeleteConfirm = ref(false);
const titleDraft = ref(props.list.title);

function handleTitleBlur() {
  const trimmed = titleDraft.value.trim();
  if (!trimmed) {
    titleDraft.value = props.list.title; // batalkan kalau dikosongkan
    return;
  }
  if (trimmed !== props.list.title) {
    listStore.updateList(props.list.id, trimmed);
  }
}

async function confirmDeleteList() {
  await listStore.deleteList(props.list.id);
  showDeleteConfirm.value = false;
}

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
  <div class="shrink-0 w-72 bg-gray-50/80 rounded-xl border border-gray-200/80 shadow-sm flex flex-col max-h-[calc(100vh-220px)]">
    <!-- Header -->
    <div class="flex items-center gap-1.5 px-3 pt-3 pb-2">
      <span class="list-drag-handle text-gray-400 hover:text-gray-500 cursor-grab active:cursor-grabbing text-sm px-0.5">
        ⠿
      </span>

      <input
        v-model="titleDraft"
        name="listTitle"
        class="min-w-0 flex-1 bg-transparent font-semibold text-gray-700 text-sm rounded px-1.5 py-1 -mx-1.5 border border-transparent hover:border-gray-300 focus:border-blue-400 focus:bg-white outline-none transition"
        @blur="handleTitleBlur"
        @keyup.enter="($event.target as HTMLInputElement).blur()"
      />

      <span class="shrink-0 text-xs font-medium text-gray-500 bg-gray-200/70 rounded-full px-2 py-0.5">
        {{ cards.length }}
      </span>

      <button
        type="button"
        class="shrink-0 text-gray-300 hover:text-red-500 transition cursor-pointer"
        title="Hapus list"
        @click="showDeleteConfirm = true"
      >
        🗑
      </button>
    </div>

    <!-- Cards -->
    <draggable
      :model-value="cards"
      item-key="id"
      group="cards"
      :disabled="!!cardStore.searchQuery"
      class="flex flex-col gap-2 px-3 pb-2 flex-1 overflow-y-auto min-h-6"
      ghost-class="opacity-40"
      @change="handleCardMove"
    >
      <template #item="{ element }">
        <CardItem :card="element" @click="emit('cardClick', element)" />
      </template>
    </draggable>

    <div class="px-3 pb-3 pt-1">
      <CreateCardForm :list-id="list.id" />
    </div>

    <DeleteListModal
      :open="showDeleteConfirm"
      :list-title="list.title"
      :loading="listStore.deleting"
      @close="showDeleteConfirm = false"
      @confirm="confirmDeleteList"
    />
  </div>
</template>