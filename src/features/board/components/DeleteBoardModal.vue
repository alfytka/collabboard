<script setup lang="ts">
import Modal from '@/shared/components/Modal.vue'

defineProps<{
  open: boolean;
  boardTitle: string;
  loading: boolean;
}>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>

<template>
  <Modal :open="open" @close="emit('close')">
    <div class="p-6">
      <h3 class="font-semibold text-gray-800 mb-2">Hapus Board?</h3>
      <p class="text-sm text-gray-600 mb-4">
        Kamu akan menghapus <strong>{{ boardTitle }}</strong> beserta semua list dan card di dalamnya. Tindakan ini tidak bisa dibatalkan.
      </p>
      <div class="flex gap-2 justify-end">
        <button
          type="button"
          :disabled="loading"
          class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          :disabled="loading"
          class="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          @click="emit('confirm')"
        >
          {{ loading ? 'Menghapus...' : 'Ya, Hapus' }}
        </button>
      </div>
    </div>
  </Modal>
</template>