import { defineStore } from 'pinia';
import type { Workspace } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useAsyncState } from '@/shared/composables/useAsyncState';

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = useAsyncState(async () => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Workspace[];
  });

  const creating = useAsyncState(async (name: string) => {
    const authStore = useAuthStore(); // <- titik relasi antar store
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const { data, error } = await supabase
      .from('workspaces')
      .insert({ name, owner_id: authStore.user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Workspace;
  });

  async function fetchWorkspaces() {
    await workspaces.execute();
  };

  async function createWorkspace(name: string) {
    const newWorkspace = await creating.execute(name);
    // update list secara manual setelah create berhasil
    if (workspaces.data.value) {
      workspaces.data.value.unshift(newWorkspace);
    }
    return newWorkspace;
  }

  return {
    workspaces: workspaces.data,
    loading: workspaces.loading,
    error: workspaces.error,
    creating: creating.loading,
    createError: creating.error,
    fetchWorkspaces,
    createWorkspace,
  };
});