<script setup lang="ts">
import DeleteWorkspaceModal from '@/features/workspace/components/DeleteWorkspaceModal.vue';
import WorkspaceCardMenu from '@/features/workspace/components/WorkspaceCardMenu.vue';
import { useWorkspaceStore } from '@/features/workspace/stores/workspace.store';
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  type ComponentPublicInstance,
} from 'vue';
import { RouterLink } from 'vue-router';

const workspaceStore = useWorkspaceStore();
const newWorkspaceName = ref('');
const newWorkspaceNameRef = ref<HTMLInputElement | null>(null);

const editingId = ref<string | null>(null);
const editInputRefs = new Map<string, HTMLInputElement>();
const editingName = ref('');
const deletingWorkspace = ref<{ id: string; name: string } | null>(null);

const openMenuId = ref<string | null>(null);

function toggleMenu(workspaceId: string) {
  openMenuId.value = openMenuId.value === workspaceId ? null : workspaceId;
}

function closeMenu() {
  openMenuId.value = null;
}

onMounted(() => {
  workspaceStore.fetchWorkspaces();
  document.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});

function setEditInputRef(
  el: Element | ComponentPublicInstance | null,
  workspaceId: string,
) {
  if (el) {
    editInputRefs.set(workspaceId, el as HTMLInputElement);
  } else {
    editInputRefs.delete(workspaceId);
  }
}

async function handleCreate() {
  if (!newWorkspaceName.value.trim()) {
    newWorkspaceNameRef.value?.focus();
    return;
  }
  await workspaceStore.createWorkspace(newWorkspaceName.value);
  newWorkspaceName.value = '';
}

async function startEdit(id: string, currentName: string) {
  editingId.value = id;
  editingName.value = currentName;

  // Tunggu Vue selesai render <input> mode edit ke DOM, baru fokuskan
  await nextTick();
  const inputEl = editInputRefs.get(id);
  inputEl?.focus();
  inputEl?.select();
}

async function saveEdit() {
  if (
    !editingId.value ||
    !editingName.value.trim() ||
    workspaceStore.updating
  ) return;
  await workspaceStore.updateWorkspace(editingId.value, editingName.value);
  editingId.value = null;
}

function closeDeleteModal() {
  if (workspaceStore.deleting) return;
  deletingWorkspace.value = null;
}

function requestDelete(id: string, name: string) {
  deletingWorkspace.value = { id, name };
}

async function confirmDelete() {
  if (!deletingWorkspace.value || workspaceStore.deleting) return;
  await workspaceStore.deleteWorkspace(deletingWorkspace.value.id);
  deletingWorkspace.value = null;
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Workspace Saya</h1>

    <form class="flex gap-2 mb-6" @submit.prevent="handleCreate">
      <input
        ref="newWorkspaceNameRef"
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
      <li v-for="workspace in workspaceStore.workspaces" :key="workspace.id">
        <!-- Edit mode -->
        <div
          v-if="editingId === workspace.id"
          class="border border-gray-300 rounded-md p-4 flex items-center gap-2"
        >
          <input
            :ref="(el) => setEditInputRef(el, workspace.id)"
            v-model="editingName"
            type="text"
            class="flex-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none py-1.5"
            @keyup.enter="saveEdit"
            @keyup.escape="editingId = null"
          />
          <div class="flex gap-1">
            <button
              class="text-sm text-blue-600 hover:bg-blue-100 px-2 py-1.5 rounded-md"
              @click="saveEdit"
              :disabled="workspaceStore.updating"
            >
              {{ workspaceStore.updating ? 'Menyimpan...' : 'Simpan' }}
            </button>
            <button
              class="text-sm text-gray-500 hover:text-gray-600 hover:bg-gray-200 px-2 py-1.5 rounded-md"
              @click="editingId = null"
              :disabled="workspaceStore.updating"
            >
              Batal
            </button>
          </div>
        </div>

        <!-- Normal mode -->
        <RouterLink
          v-else
          :to="{ name: 'workspace-detail', params: { workspaceId: workspace.id } }"
          class="flex items-center justify-between border border-gray-200 rounded-md p-4 hover:bg-gray-100 transition"
        >
          <span>{{ workspace.name }}</span>
          <WorkspaceCardMenu
            :open="openMenuId === workspace.id"
            @toggle="toggleMenu(workspace.id)"
            @rename="startEdit(workspace.id, workspace.name)"
            @delete="requestDelete(workspace.id, workspace.name)"
            @close="closeMenu"
          />
        </RouterLink>
      </li>
    </ul>

    <DeleteWorkspaceModal
      :open="!!deletingWorkspace"
      :workspace-name="deletingWorkspace?.name ?? ''"
      :loading="workspaceStore.deleting"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
</template>