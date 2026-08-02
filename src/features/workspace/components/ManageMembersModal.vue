<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useMemberStore } from '../stores/member.store';
import { onMounted, ref } from 'vue';
import { getAvatarColor, getInitials } from '@/shared/utils/avatar';
import RemoveMemberModal from './RemoveMemberModal.vue';
import Modal from '@/shared/components/Modal.vue';
import LeaveWorkspaceModal from './LeaveWorkspaceModal.vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  open: boolean;
  workspaceId: string;
  isOwner: boolean;
}>();
const emit = defineEmits<{ close: [] }>();

const router = useRouter();
const authStore = useAuthStore();
const memberStore = useMemberStore();

const showLeaveConfirm = ref(false);
const removingMember = ref<{ id: string; email: string } | null>(null);

onMounted(() => {
  memberStore.fetchMembers(props.workspaceId);
});

function requestRemove(member: { id: string; email: string }) {
  removingMember.value = member;
}

function closeRemoveModal() {
  if (memberStore.removing) return;
  removingMember.value = null;
}

async function confirmRemove() {
  if (!removingMember.value) return;
  await memberStore.removeMember(removingMember.value.id);
  removingMember.value = null;
}

function closeLeaveModal() {
  if (memberStore.leaving) return;
  showLeaveConfirm.value = false;
}

async function confirmLeave() {
  if (memberStore.leaving) return;
  await memberStore.leaveWorkspace(props.workspaceId);
  showLeaveConfirm.value = false;
  router.push({ name: 'workspaces' });
}
</script>

<template>
  <Modal :open="open" @close="emit('close')">
    <div class="p-6">
      <h3 class="font-semibold text-gray-800 mb-4">Anggota Workspace</h3>

      <div v-if="memberStore.loading" class="text-sm text-gray-400">Memuat...</div>

      <div v-else class="flex flex-col gap-2 max-h-80 overflow-y-auto">
        <div
          v-for="member in memberStore.members"
          :key="member.id"
          class="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
              :class="getAvatarColor(member.user_id)"
            >
              {{ getInitials(member.email) }}
            </div>
            <div>
              <p class="text-sm text-gray-800">
                {{ member.email }}
                <span v-if="member.user_id === authStore.user?.id" class="text-gray-400">(Kamu)</span>
              </p>
              <p class="text-xs text-gray-400 capitalize">{{ member.role }}</p>
            </div>
          </div>

          <button
            v-if="isOwner && member.role !== 'owner'"
            type="button"
            class="text-xs text-gray-400 hover:text-red-500 cursor-pointer"
            @click="requestRemove({ id: member.id, email: member.email })"
          >
            Keluarkan
          </button>
        </div>
      </div>

      <div v-if="!isOwner" class="mt-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          class="text-sm text-red-500 hover:underline cursor-pointer"
          @click="showLeaveConfirm = true"
        >
          Keluar dari Workspace
        </button>
      </div>
    </div>
  </Modal>

  <RemoveMemberModal
    :open="!!removingMember"
    :member-email="removingMember?.email ?? ''"
    :loading="memberStore.removing"
    @close="closeRemoveModal"
    @confirm="confirmRemove"
  />

  <LeaveWorkspaceModal
    :open="showLeaveConfirm"
    :loading="memberStore.leaving"
    @close="closeLeaveModal"
    @confirm="confirmLeave"
  />
</template>