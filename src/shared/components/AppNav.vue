<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import LogoutConfirmModal from './LogoutConfirmModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const showLogoutConfirm = ref(false);
const isConfirming = ref(false);

async function confirmLogout() {
  isConfirming.value = true;
  await authStore.signOut();
  isConfirming.value = false;
  showLogoutConfirm.value = false;
  router.push({ name: 'login' });
}
</script>

<template>
  <nav class="border-b border-gray-200 bg-white">
    <div class="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
      <RouterLink to="/" class="font-semibold text-gray-800">
        Collabboard
      </RouterLink>

      <div class="flex items-center gap-3">
        <span v-if="authStore.user" class="text-sm text-gray-500">
          {{ authStore.user?.email }}
        </span>
        <button
          type="button"
          class="text-sm text-gray-600 hover:text-red-600 transition cursor-pointer"
          @click="showLogoutConfirm = true"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>

  <LogoutConfirmModal
    :open="showLogoutConfirm"
    :loading="isConfirming"
    @close="showLogoutConfirm = false"
    @confirm="confirmLogout"
  />
</template>