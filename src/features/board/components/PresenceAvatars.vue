<script setup lang="ts">
import { getAvatarColor, getInitials } from '@/shared/utils/avatar';

defineProps<{
  users: Array<{
    user_id: string;
    email: string;
    online_at: string;
  }>
}>();
</script>

<template>
  <div class="flex items-center">
    <div class="flex -space-x-2">
      <div
        v-for="user in users"
        :key="user.user_id"
        :class="getAvatarColor(user.user_id)"
        class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
        :title="user.email"
      >
        {{ getInitials(user.email) }}
      </div>
    </div>
    <span v-if="users.length > 0" class="text-xs text-gray-400 ml-2">
      {{ users.length }} Online
    </span>
  </div>
</template>