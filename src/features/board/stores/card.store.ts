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

  async function moveCard(cardId: string, newListId: string, newPosition: number) {
    // Optimistic udpate: langsung ubah state local dulu, biar UI terasa instan
    const card = cards.data.value?.find((c) => c.id === cardId);
    if (!card) return;

    const oldListId = card.list_id;
    const oldPosition = card.position;
    card.list_id = newListId;
    card.position = newPosition;

    const { error } = await supabase
      .from('cards')
      .update({ list_id: newListId, position: newPosition })
      .eq('id', cardId);

    if (error) {
      // Rollback kalau gagal: inilah pentingnya simpan state lama sebelum optimistic update
      card.list_id = oldListId;
      card.position = oldPosition;
      throw error;
    }
  }

  // Computed helper: ambil cards untuk 1 list tertentu
  function cardsForList(listId: string) {
    return (cards.data.value ?? [])
      .filter((c) => c.list_id === listId)
      .sort((a, b) => a.position - b.position);
  }

  return {
    cards: cards.data,
    loading: cards.loading,
    error: cards.error,
    creating: creating.loading,
    createError: creating.error,
    fetchCardsByBoard,
    createCard,
    moveCard,
    cardsForList,
  };
});