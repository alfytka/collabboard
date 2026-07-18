<script setup lang="ts">
import CreateListForm from '@/features/board/components/CreateListForm.vue';
import ListColumn from '@/features/board/components/ListColumn.vue';
import { useCardStore } from '@/features/board/stores/card.store';
import { useListStore } from '@/features/board/stores/list.store';
import { computed, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const listStore = useListStore();
const cardStore = useCardStore();

const boardId = computed(() => {
  const id = route.params.boardId;
  return Array.isArray(id) ? id[0] : id;
});

onMounted(async () => {
  await listStore.fetchListsByBoard(boardId.value);
  await cardStore.fetchCardsByBoard(boardId.value);
});
</script>

<template>
  <div class="p-6">
    <RouterLink to="/" class="text-sm text-blue-500 hover:underline mb-4 inline-block">
      Semua Workspace
    </RouterLink>

    <div v-if="listStore.loading || cardStore.loading">Memuat board...</div>
    <div v-if="listStore.error" class="text-red-500">{{ listStore.error }}</div>

    <div v-else class="flex gap-4 overflow-x-auto pb-4">
      <ListColumn
        v-for="list in listStore.lists"
        :key="list.id"
        :list="list"
        :cards="cardStore.cardsForList(list.id)"
      />

      <CreateListForm :board-id="boardId" />
    </div>
  </div>
</template>