<script setup lang="ts">
import { useAuth } from '@/features/auth/composables/useAuth'
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { RouterLink } from 'vue-router';
import z from 'zod';

const { handleSignIn, error, loading } = useAuth();

const validationSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(6, 'Password minimal 6 karakter'),
  })
);

const { handleSubmit, defineField, errors } = useForm({
  validationSchema,
  initialValues: {
    email: '',
    password: '',
  }
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  await handleSignIn(values.email, values.password);
});
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm p-6 rounded-xl bg-white shadow-sm">
      <form class="flex flex-col gap-4" @submit="onSubmit">
        <h1 class="text-xl font-semibold text-gray-800">
          Masuk ke CollabBoard
        </h1>
  
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            placeholder="Masukkan email"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            :class="{ 'border-red-500': errors.email }"
          />
          <span v-if="errors.email" class="text-xs text-red-500">
            {{ errors.email }}
          </span>
        </div>
  
        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            placeholder="Masukkan password"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            :class="{ 'border-red-500': errors.password }"
          />
          <span v-if="errors.password" class="text-xs text-red-500">
            {{ errors.password }}
          </span>
        </div>
  
        <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {{ error }}
        </p>
  
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex justify-center px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Memproses...' : 'Login' }}
        </button>
  
        <p class="text-sm text-gray-600 text-center">
          Belum punya akun?
          <RouterLink to="/signup" class="text-blue-500 hover:underline">Daftar</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>