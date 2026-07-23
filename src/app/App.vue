<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import AppNav from '@/shared/components/AppNav.vue';
import ErrorBoundary from '@/shared/components/ErrorBoundary.vue';

const authStore = useAuthStore();
</script>

<template>
  <main class="min-h-dvh bg-gray-50 transition-colors">
    <AppNav v-if="authStore.isAuthenticated" />

    <ErrorBoundary>
      <RouterView v-slot="{ Component }">
        <Suspense v-if="Component">
          <template #default>
            <component :is="Component" />
          </template>
          <template #fallback>
            <div class="flex justify-center items-center py-20">
              <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          </template>
        </Suspense>
      </RouterView>
    </ErrorBoundary>
  </main>
</template>