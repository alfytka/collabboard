<script setup lang="ts">
import { useInvitationStore } from '@/features/workspace/stores/invitation.store';
import { useWorkspaceStore } from '@/features/workspace/stores/workspace.store';
import { onMounted } from 'vue';

const invitationStore = useInvitationStore();
const workspaceStore = useWorkspaceStore();

onMounted(() => {
  invitationStore.fetchMyInvitations();
});

async function handleAccept(id: string) {
  await invitationStore.acceptInvitation(id);
  await workspaceStore.fetchWorkspaces(); // refresh untuk langsung memunculkan list workspace baru
}
</script>

<template>
  <div v-if="invitationStore.myInvitations?.length" class="max-w-4xl mx-auto px-6 mt-3 flex flex-col gap-2">
    <div
      v-for="invite in invitationStore.myInvitations"
      :key="invite.id"
      class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-4 py-2 text-sm"
    >
      <span class="text-blue-800">
        Kamu diundang bergabung ke <strong>{{ invite.workspace_name }}</strong>
      </span>
      <div class="flex gap-2">
        <button
          type="button"
          class="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 cursor-pointer"
          @click="handleAccept(invite.id)"
        >
          Terima
        </button>
        <button
          type="button"
          class="px-3 py-1 text-blue-600 text-xs hover:underline cursor-pointer"
          @click="invitationStore.declineInvitation(invite.id)"
        >
          Tolak
        </button>
      </div>
    </div>
  </div>
</template>