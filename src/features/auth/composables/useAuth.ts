import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { ref } from 'vue';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();
  const error = ref<string | null>(null);
  const loading = ref(false);
  const signUpSuccess = ref(false); // untuk menampilkan pesan 'cek email' kalau perlu konfirmasi

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

  async function handleSignUp(email: string, password: string) {
    error.value = null;
    loading.value = true;
    try {
      const data = await authStore.signUp(email, password);

      // jika project supabase sudah matikan 'confirm email',
      // session langsung ada dan user otomatis login.
      if (data.session) {
        router.push({ name: 'workspaces' });
      } else {
        // jika 'confirm email' masih aktif, user harus cek inbox dulu
        signUpSuccess.value = true;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Pendaftaran gagal';
    } finally {
      loading.value = false;
    }
  }

  return {
    handleSignIn,
    handleSignUp,
    error,
    loading,
    signUpSuccess,
  };
}