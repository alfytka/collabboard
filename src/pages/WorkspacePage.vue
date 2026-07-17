<script setup lang="ts">
import { useWorkspaceStore } from '@/features/workspace/stores/workspace.store';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const workspaceStore = useWorkspaceStore();
const newWorkspaceName = ref('');

onMounted(() => {
  workspaceStore.fetchWorkspaces();
});

async function handleCreate() {
  if (!newWorkspaceName.value.trim()) return;
  await workspaceStore.createWorkspace(newWorkspaceName.value);
  newWorkspaceName.value = '';
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Workspace Saya</h1>

    <form class="flex gap-2 mb-6" @submit.prevent="handleCreate">
      <input
        v-model="newWorkspaceName"
        type="text"
        placeholder="Nama workspace baru..."
        class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400"
      />
      <button
        type="submit"
        :disabled="workspaceStore.creating"
        class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
      >
        {{ workspaceStore.creating ? 'Membuat...' : 'Buat' }}
      </button>
    </form>

    <p v-if="workspaceStore.createError" class="text-red-500 text-sm mb-4">
      {{ workspaceStore.createError }}
    </p>

    <p v-if="workspaceStore.loading">Memuat...</p>
    <p v-else-if="workspaceStore.error" class="text-red-500">{{ workspaceStore.error }}</p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="workspace in workspaceStore.workspaces"
        :key="workspace.id"
        class="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
      >
        <RouterLink :to="{ name: 'workspace-detail', params: { workspaceId: workspace.id } }">
          {{ workspace.name }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>