import { useAuthStore } from '@/features/auth/stores/auth.store';
import { supabase } from '@/lib/supabase';
import { useAsyncState } from '@/shared/composables/useAsyncState';
import { defineStore } from 'pinia';

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
  email: string; // hasil dari join manual ke profiles
}

export const useMemberStore = defineStore('member', () => {
  const members = useAsyncState(async (workspaceId: string) => {
    const { data: rawMembers, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const userIds = rawMembers.map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) ?? []);

    return rawMembers.map((m) => ({
      ...m,
      email: profileMap.get(m.user_id) ?? 'Pengguna',
    })) as WorkspaceMember[];
  });

  const removing = useAsyncState(async (memberId: string) => {
    if (!members.data.value) return;

    const backup = [...members.data.value];
    members.data.value = members.data.value.filter((m) => m.id !== memberId); // optimistic

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      members.data.value = backup; // rollback
      throw error;
    }
  });

  const leaving = useAsyncState(async (workspaceId: string) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('User tidak ditemukan');

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', authStore.user.id);

    if (error) throw error;
  });

  async function fetchMembers(workspaceId: string) {
    await members.execute(workspaceId);
  }

  async function removeMember(memberId: string) {
    await removing.execute(memberId);
  }

  async function leaveWorkspace(workspaceId: string) {
    await leaving.execute(workspaceId);
  }

  return {
    members: members.data,
    loading: members.loading,
    removing: removing.loading,
    leaving: leaving.loading,
    fetchMembers,
    removeMember,
    leaveWorkspace,
  };
});