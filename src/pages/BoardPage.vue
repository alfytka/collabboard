<script setup lang="ts">
import CreateListForm from '@/features/board/components/CreateListForm.vue';
import ListColumn from '@/features/board/components/ListColumn.vue';
import PresenceAvatars from '@/features/board/components/PresenceAvatars.vue';
import { useCardStore } from '@/features/board/stores/card.store';
import { useListStore } from '@/features/board/stores/list.store';
import { usePresenceStore } from '@/features/board/stores/presence.store';
import { calculatePosition } from '@/shared/utils/position';
import { computed, onMounted, onUnmounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import draggable from 'vuedraggable';

const route = useRoute();
const listStore = useListStore();
const cardStore = useCardStore();
const presenceStore = usePresenceStore();

const boardId = computed(() => {
  const id = route.params.boardId;
  return Array.isArray(id) ? id[0] : id;
});

onMounted(async () => {
  await listStore.fetchListsByBoard(boardId.value);
  await cardStore.fetchCardsByBoard(boardId.value);

  // Subscribe setelah initial fetch selesai, supaya tidak race
  // dengan data awal yang sedang di-load.
  listStore.subscribeToBoard(boardId.value);
  cardStore.subscribeToBoard(boardId.value);
  presenceStore.subscribeToBoard(boardId.value);
});

onUnmounted(() => {
  // Wajib unsubscribe saat keluar dari board, kalau tidak,
  // channel tetap aktif di background dan bikin memory leak
  // + terus nerima event untuk board yang sudah tidak dilihat user
  listStore.unsubscribe();
  cardStore.unsubscribe();
  presenceStore.unsubscribe();
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
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <RouterLink to="/" class="text-sm text-blue-500 hover:underline mb-4 inline-block">
        Semua Workspace
      </RouterLink>
      <PresenceAvatars :users="presenceStore.onlineUsers" />
    </div>

    <div v-if="listStore.loading || cardStore.loading">Memuat board...</div>
    <div v-if="listStore.error" class="text-red-500">{{ listStore.error }}</div>

    <draggable
      v-else
      :model-value="listStore.lists"
      item-key="id"
      class="flex gap-4 overflow-x-auto pb-4"
      ghost-class="opacity-40"
      handle=".list-drag-handle"
      @change="handleListMove"
    >
      <template #item="{ element: list }">
        <ListColumn :list="list" :cards="cardStore.cardsForList(list.id)" />
      </template>
      <template #footer>
        <CreateListForm :board-id="boardId" />
      </template>
    </draggable>
  </div>
</template>