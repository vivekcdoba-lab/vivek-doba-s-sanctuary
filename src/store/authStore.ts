import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'seeker';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  darkMode: boolean;
  loading: boolean;
  setAuth: (user: User | null, profile: Profile | null) => void;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  profile: null,
  darkMode: false,
  loading: true,
  setAuth: (user, profile) => set({
    isAuthenticated: !!user,
    user,
    profile,
    loading: false,
  }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null, profile: null, loading: false });
  },
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    document.documentElement.classList.toggle('dark', newMode);
    return { darkMode: newMode };
  }),
}));

// Initialize auth listener
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, user_id, email, full_name, role')
    .eq('user_id', userId)
    .maybeSingle();
  return data as Profile | null;
}

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user ?? null;
  if (user) {
    const profile = await fetchProfile(user.id);
    useAuthStore.getState().setAuth(user, profile);
  } else {
    useAuthStore.getState().setAuth(null, null);
  }
});

// Check initial session
supabase.auth.getSession().then(async ({ data: { session } }) => {
  const user = session?.user ?? null;
  if (user) {
    const profile = await fetchProfile(user.id);
    useAuthStore.getState().setAuth(user, profile);
  } else {
    useAuthStore.getState().setAuth(null, null);
  }
});
