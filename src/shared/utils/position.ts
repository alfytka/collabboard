/**
 * Hitung posisi baru untuk item yang disisipkan diantara 2 item lain.
 * - prevPosition: posisi item sebelum titik sisip (null jika disisip di paling awal)
 * - nextPosition: posisi item sesudah titik sisip (null jika disisip di paling akhir)
 */
export function calculatePosition(
  prevPosition: number | null,
  nextPosition: number | null,
): number {
  if (prevPosition === null && nextPosition === null) {
    return 1000; // list/board kosong, menjadikannya item pertama
  }
  if (prevPosition === null) {
    return nextPosition! / 2; // disisipkan sebelum item pertama
  }
  if (nextPosition === null) {
    return prevPosition + 1000; // disisipkan setelah item terakhir
  }
  return (prevPosition + nextPosition) / 2; // disisipkan di tengah 2 item
}