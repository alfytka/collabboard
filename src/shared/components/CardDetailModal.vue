<script setup lang="ts">
import { useCardStore } from '@/features/board/stores/card.store';
import { useCommentStore } from '@/features/board/stores/comment.store';
import type { Card } from '@/features/board/types';
import { ref, watch } from 'vue';
import Modal from './Modal.vue';

const props = defineProps<{
  card: Card | null;
}>();

const emit = defineEmits<{ close: [] }>();

const cardStore = useCardStore();
const commentStore = useCommentStore();

const title = ref('');
const description = ref('');
const dueDate = ref('');
const newComment = ref('');

const newCommentRef = ref<HTMLInputElement | null>(null);

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
  if (!props.card) return;
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
</script>

<template>
  <Modal :open="!!card" @close="emit('close')">
    <div v-if="card" class="p-6 flex flex-col gap-4">
      <input
        v-model="title"
        type="text"
        class="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none pb-1"
        @blur="handleSaveTitle"
      />

      <div>
        <label class="text-sm font-medium text-gray-500">
          Deskripsi
        </label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="Tambahkan deskripsi..."
          class="w-full mt-1 border border-gray-200 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"  
          @blur="handleSaveDescription"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-500">
          Tanggal Jatuh Tempo
        </label>
        <input
          v-model="dueDate"
          type="date"
          class="block mt-1 border border-gray-200 rounded-md p-2 text-sm"
          @change="handleSaveDueDate"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-500">
          Komentar
        </label>
        <div class="flex flex-col gap-2 mt-1 max-h-40 overflow-y-auto">
          <div
            v-for="comment in commentStore.comments"
            :key="comment.id"
            class="bg-gray-50 rounded-md p-2 text-sm"
          >
            {{ comment.content }}
          </div>
        </div>

        <form class="flex gap-2 mt-1" @submit.prevent="handleAddComment">
          <input
            ref="newCommentRef"
            v-model="newComment"
            type="text"
            placeholder="Tulis komentar..."
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
</template>