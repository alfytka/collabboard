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

export interface CommentWithAuthor extends Comment {
  authorEmail: string;
  is_edited: boolean;
  updated_at: string;
}

export const useCommentStore = defineStore('comment', () => {
  const comments = useAsyncState(async (cardId: string) => {
    const { data: rawComments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const userIds = [...new Set(rawComments.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) ?? []);

    return rawComments.map((c) => ({
      ...c,
      authorEmail: profileMap.get(c.user_id) ?? 'Pengguna',
    })) as CommentWithAuthor[];
  });

  const creating = useAsyncState(async (cardId: string, content: string) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({ card_id: cardId, content, user_id: authStore.user.id })
      .select()
      .single();

    if (error) throw error;

    return {
      ...comment,
      authorEmail: authStore.user.email ?? 'Pengguna',
    } as CommentWithAuthor;
  });

  const updating = useAsyncState(async (commentId: string, content: string) => {
    const comment = comments.data.value?.find((c) => c.id === commentId);
    if (!comment) return;

    const backup = { ...comment };
    comment.content = content;
    comment.is_edited = true;
    comment.updated_at = new Date().toISOString(); // optimistic, server akan koreksi jika berbeda

    const { error } = await supabase
      .from('comments')
      .update({ content, is_edited: true, updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error) {
      Object.assign(comment, backup); // rollback total
      throw error;
    }
  });

  const deleting = useAsyncState(async (commentId: string) => {
    if (!comments.data.value) return;
    const backup = [...comments.data.value];
    comments.data.value = comments.data.value.filter((c) => c.id !== commentId); // optimistic

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      comments.data.value = backup; // rollback
      throw error;
    }
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

  async function updateComment(commentId: string, content: string) {
    await updating.execute(commentId, content);
  }

  function canEditComment(comment: CommentWithAuthor): boolean {
    const createdAt = new Date(comment.created_at).getTime();
    const oneHourMs = 60 * 60 * 1000;
    return Date.now() - createdAt < oneHourMs;
  }

  async function deleteComment(commentId: string) {
    await deleting.execute(commentId);
  }

  return {
    comments: comments.data,
    loading: comments.loading,
    error: comments.error,
    creating: creating.loading,
    createError: creating.error,
    updating: updating.loading,
    updateError: updating.error,
    deleting: deleting.loading,
    deleteError: deleting.error,
    fetchComments,
    addComment,
    updateComment,
    canEditComment,
    deleteComment,
  };
});