import { supabase } from '@/lib/supabase';
import { useAsyncState } from '@/shared/composables/useAsyncState';
import { defineStore } from 'pinia';
import type { Card } from '../types';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const useCardStore = defineStore('card', () => {
  // Cards disimpan flat, di grouping by list_id saat render (bukan disimpan per list di store)
  const cards = useAsyncState(async (boardId: string) => {
    // Query cards lewat join ke lists, difilter berdasarkan board
    const { data, error } = await supabase
      .from('cards')
      .select('*, lists!inner(board_id)')
      .eq('lists.board_id', boardId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data as Card[];
  });

  const creating = useAsyncState(async (listId: string, title: string) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const currentCards = (cards.data.value ?? []).filter((c) => c.list_id === listId);
    const maxPosition = currentCards.length > 0
      ? Math.max(...currentCards.map((c) => c.position))
      : 0;

    const { data, error } = await supabase
      .from('cards')
      .insert({
        list_id: listId,
        title,
        position: maxPosition + 1000,
        created_by: authStore.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Card;
  });

  async function fetchCardsByBoard(boardId: string) {
    await cards.execute(boardId);
  }

  async function createCard(listId: string, title: string) {
    const newCard = await creating.execute(listId, title);
    if (cards.data.value) {
      cards.data.value.push(newCard);
    }
    return newCard;
  }

  // Computed helper: ambil cards untuk 1 list tertentu
  function cardsForList(listId: string) {
    return (cards.data.value ?? []).filter((c) => c.list_id === listId);
  }

  return {
    cards: cards.data,
    loading: cards.loading,
    error: cards.error,
    creating: creating.loading,
    createError: creating.error,
    fetchCardsByBoard,
    createCard,
    cardsForList,
  };
});