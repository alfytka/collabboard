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

  const updating = useAsyncState(async (workspaceId: string, name: string) => {
    const workspace = workspaces.data.value?.find((w) => w.id === workspaceId);
    if (!workspace) return;

    const oldName = workspace.name;
    workspace.name = name; // optimistic update

    const { error } = await supabase
      .from('workspaces')
      .update({ name })
      .eq('id', workspaceId);

    if (error) {
      workspace.name = oldName; // rollback
      throw error;
    }
  });

  const deleting = useAsyncState(async (workspaceId: string) => {
    if (!workspaces.data.value) return;

    const backup = [...workspaces.data.value];
    workspaces.data.value = workspaces.data.value.filter((w) => w.id !== workspaceId);

    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (error) {
      workspaces.data.value = backup; // rollback
      throw error;
    }
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

  async function updateWorkspace(workspaceId: string, name: string) {
    await updating.execute(workspaceId, name);
  }

  async function deleteWorkspace(workspaceId: string) {
    await deleting.execute(workspaceId);
  }

  return {
    workspaces: workspaces.data,
    loading: workspaces.loading,
    error: workspaces.error,
    creating: creating.loading,
    createError: creating.error,
    updating: updating.loading,
    updateError: updating.error,
    deleting: deleting.loading,
    deleteError: deleting.error,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
});