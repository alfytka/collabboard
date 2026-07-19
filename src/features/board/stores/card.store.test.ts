import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCardStore } from './card.store';

// Mock seluruh module supabase - supabase.from(...).update(...) dst akan
// mengembalikan nilai yang di kontrol, bukan hit network asli
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

import { supabase } from '@/lib/supabase';

describe('card.store - moveCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  });

  it('optimistic update: langsung ubah posisi local sebelum network selesai', async () => {
    const store = useCardStore();
    // Inject data awal langsung ke state (bypass fetch, fokus test moveCard)
    store.cards = [
      { id: 'card-1', list_id: 'list-1', position: 1000 } as any,
    ];

    await store.moveCard('card-1', 'list-2', 2500);

    expect(store.cards[0].list_id).toBe('list-2');
    expect(store.cards[0].position).toBe(2500);
  });

  it('rollback ke posisi semula kalau update Supabase gagal', async () => {
    // Override mock khusus untuk test ini - simulasikan error dari server
    vi.mocked(supabase.from).mockReturnValueOnce({
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: new Error('RLS ditolak') }),
      })),
    } as any);

    const store = useCardStore();
    store.cards = [
      { id: 'card-1', list_id: 'list-1', position: 1000 } as any,
    ];

    await expect(store.moveCard('card-1', 'list-2', 2500)).rejects.toThrow();

    // setelah gagal, harus kembali ke nilai semula, bukan tetap di nilai optimistic
    expect(store.cards[0].list_id).toBe('list-1');
    expect(store.cards[0].position).toBe(1000);
  })
})