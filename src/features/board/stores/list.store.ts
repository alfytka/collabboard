import { supabase } from '@/lib/supabase';
import { useAsyncState } from '@/shared/composables/useAsyncState';
import { defineStore } from 'pinia';
import type { List } from '../types';

export const useListStore = defineStore('list', () => {
  const lists = useAsyncState(async (boardId: string) => {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data as List[];
  });

  const creating = useAsyncState(async (boardId: string, title: string) => {
    // cari posisi terbesar saat ini di board tersebut, lalu tambah di akhir
    const currentLists = lists.data.value ?? [];
    const maxPosition = currentLists.length > 0
      ? Math.max(...currentLists.map((l) => l.position))
      : 0;

    const { data, error } = await supabase
      .from('lists')
      .insert({ board_id: boardId, title, position: maxPosition + 1000 })
      .select()
      .single();

    if (error) throw error;
    return data as List;
  });

  async function fetchListsByBoard(boardId: string) {
    await lists.execute(boardId);
  }

  async function createList(boardId: string, title: string) {
    const newList = await creating.execute(boardId, title);
    if (lists.data.value) {
      lists.data.value.push(newList); // push di akhir, bukan unshift (listt baru muncul di kanan)
    }
    return newList;
  }

  return {
    lists: lists.data,
    loading: lists.loading,
    error: lists.error,
    creating: creating.loading,
    createError: creating.error,
    fetchListsByBoard,
    createList,
  };
});