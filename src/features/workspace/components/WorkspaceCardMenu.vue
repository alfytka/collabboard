<script setup lang="ts">
defineProps<{ open: boolean }>();

const emit = defineEmits<{
  toggle: [];
  rename: [];
  delete: [];
  close: [];
}>();
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      class="p-1.5 rounded-md hover:bg-gray-200 text-gray-500"
      @click.stop.prevent="emit('toggle')"
    >
      ⋮
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1"
      @click.stop.prevent
    >
      <button
        type="button"
        class="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
        @click.stop.prevent="emit('rename'); emit('close')"
      >
        Ubah nama
      </button>
      <button
        type="button"
        class="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        @click.stop.prevent="emit('delete'); emit('close')"
      >
        Hapus
      </button>
    </div>
  </div>
</template>