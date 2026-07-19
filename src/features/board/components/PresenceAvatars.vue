<script setup lang="ts">
defineProps<{
  users: Array<{
    user_id: string;
    email: string;
    online_at: string;
  }>
}>();

function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

// Warna avatar konsisten per user, dihasilkan dari user_id
function getColor(userId: string): string {
  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
</script>

<template>
  <div class="flex items-center">
    <div class="flex -space-x-2">
      <div
        v-for="user in users"
        :key="user.user_id"
        :class="getColor(user.user_id)"
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