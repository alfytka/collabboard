<script setup lang="ts">
import Modal from '@/shared/components/Modal.vue';

defineProps<{
  open: boolean;
  loading: boolean;
}>();
const emit = defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <Modal :open="open" @close="emit('close')">
    <div class="p-6">
      <h3 class="font-semibold text-gray-800 mb-2">Keluar dari akun?</h3>
      <p class="text-sm text-gray-600 mb-4">
        Kamu perlu login kembali untuk mengakses workspace dan board kamu.
      </p>
      <div class="flex gap-2 justify-end">
        <button
          type="button"
          :disabled="loading"
          class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
          @click="emit('confirm')"
          :disabled="loading"
        >
          {{ loading ? 'Memproses...' : 'Ya, Logout' }}
        </button>
      </div>
    </div>
  </Modal>
</template>