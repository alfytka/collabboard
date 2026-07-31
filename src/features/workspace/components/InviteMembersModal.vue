<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useInvitationStore } from '../stores/invitation.store';
import { computed, onMounted } from 'vue';
import Modal from '@/shared/components/Modal.vue';

const props = defineProps<{
  open: boolean;
  workspaceId: string;
  workspaceName: string;
}>();
const emit = defineEmits<{ close: [] }>();

const authStore = useAuthStore();
const invitationStore = useInvitationStore();

onMounted(() => {
  invitationStore.fetchWorkspaceInvitations(props.workspaceId);
});

const isSelfInvite = computed(() =>
  invitationStore.emailDraft.trim().toLowerCase() === authStore.user?.email?.toLowerCase()
);

function handleSubmit() {
  if (isSelfInvite.value) return;
  invitationStore.inviteMember(
    props.workspaceId,
    props.workspaceName,
    invitationStore.emailDraft,
  );
}
</script>

<template>
  <Modal :open="open" @close="emit('close')">
    <div class="p-6">
      <h3 class="font-semibold text-gray-800 mb-1">Undang ke {{ workspaceName }}</h3>
      <p class="text-sm text-gray-500 mb-4">
        Orang yang diundang akan mendapat akses untuk melihat dan mengelola semua board di workspace ini.
      </p>

      <form
        class="flex gap-2"
        @submit.prevent="handleSubmit"
      >
        <input
          v-model="invitationStore.emailDraft"
          type="email"
          name="emailTeman"
          placeholder="Email teman..."
          autocomplete="off"
          class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          :class="{ 'border-red-300': isSelfInvite }"
        />
        <button
          type="submit"
          :disabled="invitationStore.inviting || isSelfInvite"
          class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {{ invitationStore.inviting ? 'Mengundang...' : 'Undang' }}
        </button>
      </form>

      <p v-if="isSelfInvite" class="text-sm text-amber-600 mt-2">
        Anda tidak bisa mengundang diri Anda sendiri.
      </p>

      <p v-if="invitationStore.inviteError" class="text-sm text-red-500 mt-2">
        {{ invitationStore.inviteError }}
      </p>

      <div v-if="invitationStore.workspaceInvitations?.length" class="mt-5 pt-4 border-t border-gray-100">
        <p class="text-sm font-medium text-gray-500 mb-2">Menunggu Konfirmasi</p>
        <div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          <div
            v-for="invite in invitationStore.workspaceInvitations"
            :key="invite.id"
            class="flex items-center justify-between text-sm bg-gray-100 rounded-md px-3 py-2"
          >
            <span class="text-gray-700">{{ invite.invited_email }}</span>
            <button
              v-if="invite.invited_by === authStore.user?.id"
              type="button"
              class="text-xs text-gray-500 hover:text-red-500 cursor-pointer"
              @click="invitationStore.revokeInvitation(invite.id)"
            >
              Batalkan
            </button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>