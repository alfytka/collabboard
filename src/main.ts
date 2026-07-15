import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia';
import router from './app/router/index.ts';
import { useAuthStore } from './features/auth/stores/auth.store.ts';

const app = createApp(App);
app.use(createPinia());

// Inisialisasi auth SEBELUM mount, supaya guard router punya data yang benar
const authStore = useAuthStore();
authStore.initialize().then(() => {
  app.use(router);
  app.mount('#app')
});
