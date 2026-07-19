import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/features/auth/stores/auth.store.ts';
import router from './router/index.ts';
import { setupGlobalErrorHandling } from './errorHandler.ts';
import { vShortcut } from '@/shared/directives/vShortcut.ts';

const app = createApp(App);
app.directive('shortcut', vShortcut)
app.use(createPinia());
setupGlobalErrorHandling(app);

// Inisialisasi auth SEBELUM mount, supaya guard router punya data yang benar
const authStore = useAuthStore();
authStore.initialize().then(() => {
  app.use(router);
  app.mount('#app')
});
