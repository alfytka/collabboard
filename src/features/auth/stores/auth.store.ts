import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const isInitialized = ref(false); // penting untuk guard

  const isAuthenticated = computed(() => !!session.value);

  async function initialize() {
    // Ambil session yang tersimpan (jika user refresh browser)
    const { data } = await supabase.auth.getSession();
    session.value = data.session;
    user.value = data.session?.user ?? null;
    isInitialized.value = true;

    // listen perubahan auth state (login, logout, token refreshed)
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
    });
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return {
    user,
    session,
    isInitialized,
    isAuthenticated,
    initialize,
    signUp,
    signIn,
    signOut,
  };
});