import { describe, expect, it } from 'vitest';
import { calculatePosition } from './position';

describe('calculatePosition', () => {
  it('mengembalikan 1000 kalau board kosong (tidak ada prev/next)', () => {
    expect(calculatePosition(null, null)).toBe(1000);
  });

  it('mengembalikan setengah dari next kalau disisip paling awal', () => {
    expect(calculatePosition(null, 1000)).toBe(500);
  });

  it('mengembalikan 1000 dari prev kalau disisip paling akhir', () => {
    expect(calculatePosition(1000, null)).toBe(2000);
  });

  it('mengembalikan rata-rata kalau disisp di antara 2 posisi', () => {
    expect(calculatePosition(1000, 2000)).toBe(1500);
  });

  it('tetap menghasilkan posisi valid untuk celah yang sangat kecil', () => {
    const result = calculatePosition(1000, 1000.001);
    expect(result).toBeGreaterThan(1000);
    expect(result).toBeLessThan(1000.001);
  });
});