import { useAuthStore } from '@/features/auth/stores/auth.store';
import { supabase } from '@/lib/supabase';
import { useAsyncState } from '@/shared/composables/useAsyncState';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Invitation {
  id: string;
  workspace_id: string;
  workspace_name: string;
  invited_email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export const useInvitationStore = defineStore('invitation', () => {
  // Invitations addressed to me (for notification banners)
  const myInvitations = useAsyncState(async () => {
    const authStore = useAuthStore();
    if (!authStore.user?.email) return [];
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invited_email', authStore.user.email)
      .eq('status', 'pending');

    if (error) throw error;
    return data as Invitation[];
  });

  // The invitation I sent for 1 workspace (for manage page)
  const workspaceInvitations = useAsyncState(async (workspaceId: string) => {
    const authStore = useAuthStore();
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .neq('invited_email', authStore.user?.email ?? '') // mengecualikan undangan untuk diri sendiri
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invitation[];
  });

  const creating = useAsyncState(async (
    workspaceId: string,
    workspaceName: string,
    email: string,
  ) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('User tidak ditemukan');

    if (email.toLowerCase().trim() === authStore.user.email?.toLowerCase()) {
      throw new Error('Anda tidak bisa mengundang diri Anda sendiri.');
    }

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        workspace_id: workspaceId,
        workspace_name: workspaceName,
        invited_email: email.toLowerCase().trim(),
        invited_by: authStore.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Email ini sudah diundang dan masih menunggu konfirmasi.');
      }
      if (error.code === '42501') {
        throw new Error('Undangan tidak valid.'); // fallback jika RLS with check gagal
      }
      throw error;
    }
    return data as Invitation;
  });

  async function fetchMyInvitations() {
    await myInvitations.execute();
  }

  async function fetchWorkspaceInvitations(workspaceId: string) {
    await workspaceInvitations.execute(workspaceId);
  }

  const emailDraft = ref('');

  async function inviteMember(workspaceId: string, workspaceName: string, email: string) {
    if (!emailDraft.value.trim()) return;
    const invite = await creating.execute(workspaceId, workspaceName, email);
    if (workspaceInvitations.data.value) {
      workspaceInvitations.data.value.unshift(invite);
    }
    emailDraft.value = '';
    return invite;
  }

  async function acceptInvitation(invitationId: string) {
    const { error } = await supabase.rpc('accept_invitation', { invitation_id: invitationId });
    if (error) throw error;
    if (myInvitations.data.value) {
      myInvitations.data.value = myInvitations.data.value.filter((i) => i.id !== invitationId);
    }
  }

  async function declineInvitation(invitationId: string) {
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (error) throw error;
    if (myInvitations.data.value) {
      myInvitations.data.value = myInvitations.data.value.filter((i) => i.id !== invitationId);
    }
  }

  async function revokeInvitation(invitationId: string) {
    if (!workspaceInvitations.data.value) return;
    const backup = [...workspaceInvitations.data.value];
    // optimistic
    workspaceInvitations.data.value = workspaceInvitations.data.value.filter((i) => i.id !== invitationId);

    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      workspaceInvitations.data.value = backup; // rollback
      throw error;
    }
  }

  return {
    myInvitations: myInvitations.data,
    myInvitationsLoading: myInvitations.loading,
    workspaceInvitations: workspaceInvitations.data,
    inviting: creating.loading,
    inviteError: creating.error,
    emailDraft,
    fetchMyInvitations,
    fetchWorkspaceInvitations,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    revokeInvitation,
  };
});