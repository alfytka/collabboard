import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Workspace } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchWorkspaces() {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      workspaces.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat workspace';
    } finally {
      loading.value = false;
    }
  }

  async function createWorkspace(name: string) {
    const authStore = useAuthStore(); // <- titik relasi antar store
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const { data, error: err } = await supabase
      .from('workspaces')
      .insert({ name, owner_id: authStore.user.id })
      .select()
      .single();

    if (err) throw err;
    workspaces.value.unshift(data); // optimistic-ish: langsung tampil tanpa fetch ulang
    return data;
  }

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
  };
});