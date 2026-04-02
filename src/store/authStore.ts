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
async function fetchProfile(userId: string, userEmail?: string, metadata?: any): Promise<Profile | null> {
  const profilePromise = supabase
    .from('profiles')
    .select('id, user_id, email, full_name, role')
    .eq('user_id', userId)
    .maybeSingle();
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('timeout')), 3000)
  );

  try {
    const { data } = await Promise.race([profilePromise, timeoutPromise]) as any;
    return data as Profile | null;
  } catch {
    console.warn('Profile fetch timed out, using metadata fallback');
    return {
      id: userId,
      user_id: userId,
      email: userEmail || '',
      full_name: metadata?.full_name || userEmail || '',
      role: metadata?.role || 'seeker',
    } as Profile;
  }
}

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user ?? null;
  if (user) {
    const profile = await fetchProfile(user.id, user.email, user.user_metadata);
    useAuthStore.getState().setAuth(user, profile);
  } else {
    useAuthStore.getState().setAuth(null, null);
  }
});

// Check initial session
supabase.auth.getSession().then(async ({ data: { session } }) => {
  const user = session?.user ?? null;
  if (user) {
    const profile = await fetchProfile(user.id, user.email, user.user_metadata);
    useAuthStore.getState().setAuth(user, profile);
  } else {
    useAuthStore.getState().setAuth(null, null);
  }
});
