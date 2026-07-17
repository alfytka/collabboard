<script setup lang="ts">
import BoardCard from '@/features/board/components/BoardCard.vue';
import CreateBoardForm from '@/features/board/components/CreateBoardForm.vue';
import { useBoardStore } from '@/features/board/stores/board.store';
import { useWorkspaceStore } from '@/features/workspace/stores/workspace.store';
import { computed, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();

// route.params.workspaceId bisa string | string[], pastikan selalu string
const workspaceId = computed(() => {
  const id = route.params.workspaceId;
  return Array.isArray(id) ? id[0] : id;
});

// cari nama workspace dari data yang sudah ada di workspaceStore
// (menghindari fetch ulang kalau user datang dari WorkspacePage)
const currentWorkspace = computed(() =>
  workspaceStore.workspaces?.find((w) => w.id === workspaceId.value)
);

onMounted(() => {
  boardStore.fetchBoardsByWorkspace(workspaceId.value);
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-6">
      <RouterLink to="/" class="text-sm text-blue-50 hover:underline">
        Semua Workspace
      </RouterLink>
      <h1 class="text-2xl font-bold mt-2">
        {{ currentWorkspace?.name ?? 'Workspace' }}
      </h1>
    </div>

    <CreateBoardForm :workspace-id="workspaceId" />

    <p v-if="boardStore.loading" class="mt-6">Memuat board...</p>
    <p v-else-if="boardStore.error" class="text-red-500 mt-6">{{ boardStore.error }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      <BoardCard
        v-for="board in boardStore.boards"
        :key="board.id"
        :board="board"
      />
    </div>

    <p v-if="!boardStore.loading && boardStore.boards?.length === 0" class="text-gray-500 mt-6">
      Belum ada board. Buat board pertama kamu!
    </p>
  </div>
</template>