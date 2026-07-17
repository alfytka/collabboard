import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Board } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchBoardsByWorkspace(workspaceId: string) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from('boards')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      boards.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat board';
    } finally {
      loading.value = false;
    }
  }

  async function createBoard(workspaceId: string, title: string) {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const { data, error: err } = await supabase
      .from('boards')
      .insert({ workspace_id: workspaceId, title, created_by: authStore.user.id })
      .select()
      .single();

    if (err) throw err;
    boards.value.unshift(data);
    return data;
  }

  return {
    boards,
    loading,
    error,
    fetchBoardsByWorkspace,
    createBoard,
  };
});