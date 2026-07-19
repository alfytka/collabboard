import type { App } from 'vue';

export function setupGlobalErrorHandling(app: App) {
  // Menangkap error dari lifecycle/render Vue yang TIDAK tertangkap ErrorBoundary manapun
  // (misal terjadi di komponen yang tidak dibungkus ErrorBoundary sama sekali)
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Global Error Hanlder]', err, info);
    // di sini bisa kirim ke error tracking service (Sentry, dll)
  };

  // Menangkap Promise yang di-reject tapi tidak pernah di-.catch() di mana pun
  // Contoh kasus nyata: kalau kamu lupa `await` sebuah action store, errornya
  // akan lolos dari try/catch manapun dan cuma muncul di sini
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    event.preventDefault(); // mencegah browser log error default yang lebih berisik
  });
}