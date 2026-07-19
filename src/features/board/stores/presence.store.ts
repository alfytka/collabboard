import { useAuthStore } from '@/features/auth/stores/auth.store';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { ref } from 'vue';

interface PresenceUser {
  user_id: string;
  email: string;
  online_at: string;
}

export const usePresenceStore = defineStore('presence', () => {
  const onlineUsers = ref<PresenceUser[]>([]);
  let channel: RealtimeChannel | null = null;

  function subscribeToBoard(boardId: string) {
    const authStore = useAuthStore();
    if (!authStore.user) return;

    channel = supabase.channel(`presence:board:${boardId}`, {
      config: {
        presence: { key: authStore.user.id },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel!.presenceState<PresenceUser>();
        // presenceState mengembalikan object { [userId]: PresenceUser[] }
        // kita flatten jadi array, ambil entry pertama tiap user
        onlineUsers.value = Object.values(state).map((entries) => entries[0]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel!.track({
            user_id: authStore.user!.id,
            email: authStore.user!.email,
            online_at: new Date().toISOString(),
          });
        }
      });
  }

  async function unsubscribe() {
    if (channel) {
      await channel.untrack(); // kirim 'saya keluar' dulu, tunggu selesai
      await supabase.removeChannel(channel); // baru tutup koneksi
      channel = null;
      onlineUsers.value = [];
    }
  }

  return { onlineUsers, subscribeToBoard, unsubscribe };
});