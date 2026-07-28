<script setup lang="ts">
import { useCardStore } from '@/features/board/stores/card.store';
import { useCommentStore, type CommentWithAuthor } from '@/features/board/stores/comment.store';
import type { Card } from '@/features/board/types';
import { ref, watch } from 'vue';
import Modal from './Modal.vue';
import { formatRelativeTime, getAvatarColor, getInitials } from '../utils/avatar.ts';
import { useAuthStore } from '@/features/auth/stores/auth.store.ts';
import DeleteCommentModal from './DeleteCommentModal.vue';

const props = defineProps<{
  card: Card | null;
}>();

const emit = defineEmits<{ close: [] }>();

const cardStore = useCardStore();
const commentStore = useCommentStore();
const authStore = useAuthStore();

const title = ref('');
const description = ref('');
const dueDate = ref('');
const newComment = ref('');

const newCommentRef = ref<HTMLInputElement | null>(null);

const editingCommentId = ref<string | null>(null);
const editingCommentContent = ref('');

const deletingComment = ref<{ id: string; preview: string } | null>(null);

// Sync form state setiap kali card yang dibuka berganti
watch(
  () => props.card,
  (card) => {
    if (card) {
      title.value = card.title;
      description.value = card.description ?? '';
      dueDate.value = card.due_date?.slice(0, 10) ?? ''; // format YYYY-MM-DD untuk <input type="date">
      commentStore.fetchComments(card.id);
    }
  },
  { immediate: true }
);

async function handleSaveTitle() {
  if (!props.card || title.value === props.card.title) return;
  await cardStore.updateCard(props.card.id, { title: title.value });
}

async function handleSaveDescription() {
  if (!props.card || description.value === props.card.description) return;
  await cardStore.updateCard(props.card.id, { description: description.value });
}

async function handleSaveDueDate() {
  if (!props.card) return;
  await cardStore.updateCard(props.card.id, {
    due_date: dueDate.value ? new Date(dueDate.value).toISOString() : null,
  });
}

async function handleAddComment() {
  if (!newComment.value.trim()) {
    newCommentRef.value?.focus();
    return;
  }
  if (!props.card) return;
  await commentStore.addComment(props.card.id, newComment.value);
  newComment.value = '';
}

function startEditComment(comment: CommentWithAuthor) {
  editingCommentId.value = comment.id;
  editingCommentContent.value = comment.content;
}

async function saveEditComment() {
  if (!editingCommentId.value || !editingCommentContent.value.trim()) return;
  await commentStore.updateComment(editingCommentId.value, editingCommentContent.value);
  editingCommentId.value = null;
}

function requestDeleteComment(comment: CommentWithAuthor) {
  const preview = comment.content.length > 40
    ? comment.content.slice(0, 40) + '...'
    : comment.content;
  deletingComment.value = { id: comment.id, preview };
}

function closeDeleteCommentModal() {
  if (commentStore.deleting) return;
  deletingComment.value = null;
}

async function confirmDeleteComment() {
  if (!deletingComment.value) return;
  await commentStore.deleteComment(deletingComment.value.id);
  deletingComment.value = null;
}
</script>

<template>
  <Modal :open="!!card" @close="emit('close')">
    <div v-if="card" class="p-6 flex flex-col gap-4">
      <input
        v-model="title"
        type="text"
        name="title"
        class="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none pb-1"
        @blur="handleSaveTitle"
      />

      <div>
        <label for="deskripsi" class="text-sm font-medium text-gray-500">
          Deskripsi
        </label>
        <textarea
          v-model="description"
          id="deskripsi"
          rows="3"
          placeholder="Tambahkan deskripsi..."
          class="w-full mt-1 border border-gray-200 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"  
          @blur="handleSaveDescription"
        />
      </div>

      <div>
        <label for="date" class="text-sm font-medium text-gray-500">
          Tanggal Jatuh Tempo
        </label>
        <input
          v-model="dueDate"
          type="date"
          id="date"
          class="block w-full mt-1 border border-gray-200 rounded-md p-2 text-sm"
          @change="handleSaveDueDate"
        />
      </div>

      <div>
        <label for="newComment" class="text-sm font-medium text-gray-500">
          Komentar
        </label>
        <div class="flex flex-col gap-3 mt-2 max-h-52 overflow-y-auto pr-1">
          <div
            v-for="comment in commentStore.comments"
            :key="comment.id"
            class="flex gap-2 group"
          >
            <div
              class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
              :class="getAvatarColor(comment.user_id)"
            >
              {{ getInitials(comment.authorEmail) }}
            </div>

            <div class="flex-1 min-w-0 bg-gray-100 rounded-lg px-3 py-2">
              <div class="flex items-baseline justify-between gap-2">
                <span class="text-sm font-medium text-gray-800">
                  {{ comment.user_id === authStore.user?.id ? 'Kamu' : comment.authorEmail }}
                </span>
                <span class="text-xs text-gray-500 shrink-0">
                  {{ formatRelativeTime(comment.created_at) }}
                  <span v-if="comment.is_edited">(diedit)</span>
                </span>
              </div>

              <!-- Mode edit -->
              <div v-if="editingCommentId === comment.id" class="flex flex-col gap-1">
                <input
                  v-model="editingCommentContent"
                  type="text"
                  class="text-sm border-b border-blue-500 outline-none py-0.5"
                  @keyup.enter="saveEditComment"
                  @keyup.escape="editingCommentId = null"
                  autofocus
                />
                <div class="flex gap-2 my-0.5 text-xs">
                  <button type="button" class="text-blue-600 cursor-pointer" @click="saveEditComment">
                    Simpan
                  </button>
                  <button type="button" class="text-gray-500 cursor-pointer" @click="editingCommentId = null">
                    Batal
                  </button>
                </div>
              </div>

              <!-- Mode normal -->
              <p v-else class="text-sm text-gray-600 mt-0.5 wrap-break-word">
                {{ comment.content }}
              </p>
            </div>

            <div
              v-if="comment.user_id === authStore.user?.id && editingCommentId !== comment.id"
              class="opacity-0 group-hover:opacity-100 flex flex-col gap-1 text-xs self-start mt-2 transition"
            >
              <button
                v-if="commentStore.canEditComment(comment)"
                type="button"
                class="text-gray-400 hover:text-blue-500 cursor-pointer"
                @click="startEditComment(comment)"
              >
                Edit
              </button>
              <button
                type="button"
                class="text-gray-400 hover:text-red-500 cursor-pointer"
                @click="requestDeleteComment(comment)"
              >
                Hapus
              </button>
            </div>
          </div>

          <p v-if="commentStore.comments?.length === 0" class="text-sm text-gray-400 italic">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </p>
        </div>

        <form class="flex gap-2 mt-3" @submit.prevent="handleAddComment">
          <input
            ref="newCommentRef"
            v-model="newComment"
            id="newComment"
            type="text"
            placeholder="Tulis komentar..."
            autocomplete="off"
            class="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            class="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  </Modal>

  <DeleteCommentModal
    :open="!!deletingComment"
    :comment-preview="deletingComment?.preview ?? ''"
    :loading="commentStore.deleting"
    @close="closeDeleteCommentModal"
    @confirm="confirmDeleteComment"
  />
</template>