<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

const hasError = ref(false);
const errorMessage = ref('');

function reset() {
  hasError.value = false;
  errorMessage.value = '';
}

// onErrorCaptured menangkap error dari SEMUA slot children di bawahnya
// Parameter: err (object error), instance (komponen mana yang error), info (konteks, misal "render function")
onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  errorMessage.value = err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga';

  // Log detail untuk debugging — di production, ini bisa dikirim ke Sentry/LogRocket dsb
  console.error('[ErrorBoundary] Error tertangkap:', err, 'di komponen:', instance, 'info:', info);

  // Return false = HENTIKAN error agar tidak "propagate" lagi ke parent boundary di atasnya
  // Kalau return true / tidak return apapun, error tetap diteruskan ke boundary lain (kalau ada)
  return false;
});
</script>

<template>
  <div v-if="hasError" class="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-xl text-center">
    <p class="text-red-600 font-medium mb-2">⚠️ Terjadi kesalahan</p>
    <p class="text-sm text-red-500 mb-4">{{ errorMessage }}</p>
    <button
      @click="reset"
      class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
    >
      Coba Lagi
    </button>
  </div>

  <!-- Kalau tidak ada error, render children seperti biasa lewat default slot -->
  <slot v-else />
</template>