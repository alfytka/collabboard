<script setup lang="ts">
import BoardCard from '@/features/board/components/BoardCard.vue';
import CreateBoardForm from '@/features/board/components/CreateBoardForm.vue';
import DeleteBoardModal from '@/features/board/components/DeleteBoardModal.vue';
import { useBoardStore } from '@/features/board/stores/board.store';
import { useWorkspaceStore } from '@/features/workspace/stores/workspace.store';
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  type ComponentPublicInstance,
} from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();

const editingId = ref<string | null>(null);
const editingTitle = ref('');
const editInputRefs = new Map<string, HTMLInputElement>();

const deletingBoard = ref<{ id: string; title: string } | null>(null);
const openMenuId = ref<string | null>(null);

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
  document.addEventListener('click', closeMenu)
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});

function toggleMenu(boardId: string) {
  openMenuId.value = openMenuId.value == boardId ? null : boardId;
}

function closeMenu() {
  openMenuId.value = null;
}

function setEditInputRef(
  el: Element | ComponentPublicInstance | null,
  boardId: string,
) {
  if (el) editInputRefs.set(boardId, el as HTMLInputElement);
  else editInputRefs.delete(boardId);
}

async function startEdit(boardId: string, currentTitle: string) {
  editingId.value = boardId;
  editingTitle.value = currentTitle;
  await nextTick();
  const inputEl = editInputRefs.get(boardId);
  inputEl?.focus();
  inputEl?.select();
}

async function saveEdit() {
  if (
    !editingId.value ||
    !editingTitle.value.trim() ||
    boardStore.updating
  ) return;
  await boardStore.updateBoard(editingId.value, editingTitle.value);
  editingId.value = null;
}

function requestDelete(boardId: string, title: string) {
  deletingBoard.value = { id: boardId, title };
}

function closeDeleteModal() {
  if (boardStore.deleting) return;
  deletingBoard.value = null;
}

async function confirmDelete() {
  if (!deletingBoard.value || boardStore.deleting) return;
  await boardStore.deleteBoard(deletingBoard.value.id);
  deletingBoard.value = null;
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-6">
      <RouterLink to="/" class="text-sm text-blue-500 hover:underline inline-block">
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
        :is-editing="editingId === board.id"
        :is-menu-open="openMenuId === board.id"
        @toggle-menu="toggleMenu(board.id)"
        @close-menu="closeMenu"
        @start-edit="startEdit(board.id, board.title)"
        @request-delete="requestDelete(board.id, board.title)"
      >
        <template #edit-form>
          <div class="flex flex-col space-y-0.5">
            <input
              :ref="(el) => setEditInputRef(el, board.id)"
              v-model="editingTitle"
              type="text"
              class="flex-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
              @keyup.enter="saveEdit"
              @keyup.escape="editingId = null"
            />
            <div class="flex items-center gap-0.5">
              <button
                class="text-sm text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md"
                @click="saveEdit"
                :disabled="boardStore.updating"
              >
                {{ boardStore.updating ? 'Menyimpan...' : 'Simpan' }}
              </button>
              <button
                class="text-sm text-gray-500 hover:text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-md"
                @click="editingId = null"
                :disabled="boardStore.updating"
              >
                Batal
              </button>
            </div>
          </div>
        </template>
      </BoardCard>
    </div>

    <p v-if="!boardStore.loading && boardStore.boards?.length === 0" class="text-gray-500 mt-6">
      Belum ada board. Buat board pertama kamu!
    </p>

    <DeleteBoardModal
      :open="!!deletingBoard"
      :board-title="deletingBoard?.title ?? ''"
      :loading="boardStore.deleting"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
</template>