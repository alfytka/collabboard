import { useAuthStore } from '@/features/auth/stores/auth.store';
import { supabase } from '@/lib/supabase';
import { useAsyncState } from '@/shared/composables/useAsyncState';
import { defineStore } from 'pinia';

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const useCommentStore = defineStore('comment', () => {
  const comments = useAsyncState(async (cardId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Comment[];
  });

  const creating = useAsyncState(async (cardId: string, content: string) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const { data, error } = await supabase
      .from('comments')
      .insert({ card_id: cardId, content, user_id: authStore.user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  });

  async function fetchComments(cardId: string) {
    await comments.execute(cardId);
  }

  async function addComment(cardId: string, content: string) {
    const newComment = await creating.execute(cardId, content);
    if (comments.data.value) {
      comments.data.value.push(newComment);
    }
    return newComment;
  }

  return {
    comments: comments.data,
    loading: comments.loading,
    error: comments.error,
    creating: creating.loading,
    createError: creating.error,
    fetchComments,
    addComment,
  };
});