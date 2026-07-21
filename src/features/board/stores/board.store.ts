import { defineStore } from 'pinia';
import type { Board } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useAsyncState } from '@/shared/composables/useAsyncState';

export const useBoardStore = defineStore('board', () => {
  const boards = useAsyncState(async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Board[];
  });

  const creating = useAsyncState(async (workspaceId: string, title: string) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const { data, error: err } = await supabase
      .from('boards')
      .insert({ workspace_id: workspaceId, title, created_by: authStore.user.id })
      .select()
      .single();

    if (err) throw err;
    return data as Board;
  });

  const updating = useAsyncState(async (boardId: string, title: string) => {
    const board = boards.data.value?.find((b) => b.id === boardId);
    if (!board) return;

    const oldTitle = board.title;
    board.title = title; // optimistic

    const { error } = await supabase
      .from('boards')
      .update({ title })
      .eq('id', boardId);

    if (error) {
      board.title = oldTitle; // rollback
      throw error;
    }
  });

  const deleting = useAsyncState(async (boardId: string) => {
    if (!boards.data.value) return;

    const backup = [...boards.data.value];
    boards.data.value = boards.data.value.filter((b) => b.id !== boardId); // optimistic

    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId);

    if (error) {
      boards.data.value = backup; // rollback
      throw error;
    }
  });

  async function fetchBoardsByWorkspace(workspaceId: string) {
    await boards.execute(workspaceId);
  }

  async function createBoard(workspaceId: string, title: string) {
    const newBoard = await creating.execute(workspaceId, title);
    if (boards.data.value) {
      boards.data.value.unshift(newBoard);
    }
    return newBoard;
  }

  async function updateBoard(boardId: string, title: string) {
    await updating.execute(boardId, title);
  }

  async function deleteBoard(boardId: string) {
    await deleting.execute(boardId);
  }

  return {
    boards: boards.data,
    loading: boards.loading,
    error: boards.error,
    creating: creating.loading,
    createError: creating.error,
    updating: updating.loading,
    updateError: updating.error,
    deleting: deleting.loading,
    deleteError: deleting.error,
    fetchBoardsByWorkspace,
    createBoard,
    updateBoard,
    deleteBoard,
  };
});