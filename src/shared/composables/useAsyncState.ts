import { ref } from 'vue';

/**
 * Generic wrapper untuk operasi async apapun (bukan cuma Supabase query).
 * T = tipe data hasil, Args = tipe argumen yang diterima fungsi async-nya.
 */
export function useAsyncState<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const data = ref<T | null>(null) as import('vue').Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function execute(...args: Args) {
    loading.value = true;
    error.value = null;
    try {
      const result = await asyncFn(...args);
      data.value = result;
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Terjadi kesalahan';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    error,
    execute,
  };
}