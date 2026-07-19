<script setup lang="ts">
import CreateListForm from '@/features/board/components/CreateListForm.vue';
import ListColumn from '@/features/board/components/ListColumn.vue';
import PresenceAvatars from '@/features/board/components/PresenceAvatars.vue';
import SearchBar from '@/features/board/components/SearchBar.vue';
import { useCardStore } from '@/features/board/stores/card.store';
import { useListStore } from '@/features/board/stores/list.store';
import { usePresenceStore } from '@/features/board/stores/presence.store';
import type { Card } from '@/features/board/types';
import CardDetailModal from '@/shared/components/CardDetailModal.vue';
import SkeletonBoard from '@/shared/components/SkeletonBoard.vue';
import { calculatePosition } from '@/shared/utils/position';
import { computed, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import draggable from 'vuedraggable';

const route = useRoute();
const listStore = useListStore();
const cardStore = useCardStore();
const presenceStore = usePresenceStore();

const selectedCard = ref<Card | null>(null);
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null);

const boardId = computed(() => {
  const id = route.params.boardId;
  return Array.isArray(id) ? id[0] : id;
});

async function loadBoard(newId: string, oldId?: string) {
  // Cleanup subscription lama, kalau ada (bukan initial load)
  if (oldId) {
    listStore.unsubscribe();
    cardStore.unsubscribe();
    await presenceStore.unsubscribe();
  }

  await listStore.fetchListsByBoard(newId);
  await cardStore.fetchCardsByBoard(newId);

  // Subscribe setelah initial fetch selesai, supaya tidak race
  // dengan data awal yang sedang di-load.
  listStore.subscribeToBoard(newId);
  cardStore.subscribeToBoard(newId);
  presenceStore.subscribeToBoard(newId);
}

// immediate: true membuat ini jalan otomatis saat komponen pertama kali setup,
// jadi tidak perlu onMounted terpisah lagi untuk fetch + subscribe awal
watch(boardId, loadBoard, { immediate: true });

onUnmounted(async () => {
  // Wajib unsubscribe saat keluar dari board, kalau tidak,
  // channel tetap aktif di background dan bikin memory leak
  // + terus nerima event untuk board yang sudah tidak dilihat user
  listStore.unsubscribe();
  cardStore.unsubscribe();
  await presenceStore.unsubscribe(); // await, supaya benar-benar selesai sebelum lanjut
});

function handleListMove(event: any) {
  if (!event.moved) return;
  const { element, newIndex } = event.moved;
  const siblings = (listStore.lists).filter((l) => l.id !== element.id);
  const prevList = siblings[newIndex - 1];
  const nextList = siblings[newIndex];
  const newPosition = calculatePosition(
    prevList?.position ?? null,
    nextList?.position ?? null,
  );
  listStore.moveList(element.id, newPosition);
}

function openCard(card: Card) {
  selectedCard.value = card;
}

function closeCard() {
  selectedCard.value = null;
}

function focusSearch() {
  searchBarRef.value?.focus();
}

function closeModalOrClearSearch() {
  if (selectedCard.value) {
    closeCard();
  } else if (cardStore.searchQuery) {
    cardStore.searchQuery = '';
  }
}
</script>

<template>
  <div
    class="p-6"
    v-shortcut="[
      { key: 'k', ctrl: true, handler: focusSearch },
      { key: 'Escape', handler: closeModalOrClearSearch },
    ]"
  >
    <div class="flex items-center justify-between mb-4">
      <RouterLink to="/" class="text-sm text-blue-500 hover:underline mb-4 inline-block">
        Semua Workspace
      </RouterLink>
      <PresenceAvatars :users="presenceStore.onlineUsers" />
    </div>

    <SearchBar ref="searchBarRef" />

    <SkeletonBoard v-if="listStore.loading || cardStore.loading" />
    <div v-if="listStore.error" class="text-red-500">{{ listStore.error }}</div>

    <draggable
      v-else
      :model-value="listStore.lists"
      item-key="id"
      :disabled="!!cardStore.searchQuery"
      class="flex gap-4 overflow-x-auto pb-4"
      ghost-class="opacity-40"
      handle=".list-drag-handle"
      @change="handleListMove"
    >
      <template #item="{ element: list }">
        <ListColumn
          :list="list"
          :cards="cardStore.cardsForList(list.id)"
          @card-click="openCard"
        />
      </template>
      <template #footer>
        <CreateListForm :board-id="boardId" />
      </template>
    </draggable>

    <CardDetailModal :card="selectedCard" @close="closeCard" />
  </div>
</template>