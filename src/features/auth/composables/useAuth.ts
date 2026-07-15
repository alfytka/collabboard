import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { ref } from 'vue';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();
  const error = ref<string | null>(null);
  const loading = ref(false);

  async function handleSignIn(email: string, password: string) {
    error.value = null;
    loading.value = true;
    try {
      await authStore.signIn(email, password);
      router.push({ name: 'workspaces' });
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login gagal';
    } finally {
      loading.value = false;
    }
  }

  return { handleSignIn, error, loading };
}