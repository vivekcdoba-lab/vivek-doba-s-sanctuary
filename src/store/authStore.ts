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
  sessionId: string | null;
  darkMode: boolean;
  loading: boolean;
  setAuth: (user: User | null, profile: Profile | null) => void;
  setSessionId: (id: string | null) => void;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
}

function clearAllAuthStorage() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) {
      localStorage.removeItem(key);
    }
  });
  localStorage.removeItem('vdts_session_id');
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  profile: null,
  sessionId: localStorage.getItem('vdts_session_id'),
  darkMode: false,
  loading: true,
  setAuth: (user, profile) => set({
    isAuthenticated: !!user,
    user,
    profile,
    loading: false,
  }),
  setSessionId: (id) => {
    if (id) {
      localStorage.setItem('vdts_session_id', id);
    } else {
      localStorage.removeItem('vdts_session_id');
    }
    set({ sessionId: id });
  },
  logout: async () => {
    const { sessionId } = get();
    if (sessionId) {
      try {
        await supabase.functions.invoke('session-heartbeat', {
          body: { action: 'end', session_id: sessionId },
        });
      } catch { /* ignore */ }
    }
    await supabase.auth.signOut();
    clearAllAuthStorage();
    set({ isAuthenticated: false, user: null, profile: null, sessionId: null, loading: false });
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

async function validateSessionOnInit(userId: string, userEmail?: string, metadata?: any) {
  const storedSessionId = localStorage.getItem('vdts_session_id');
  
  if (!storedSessionId) {
    // No tracked session — force sign out
    await supabase.auth.signOut();
    clearAllAuthStorage();
    useAuthStore.getState().setAuth(null, null);
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke('session-heartbeat', {
      body: { action: 'heartbeat', session_id: storedSessionId },
    });

    if (error || !data?.active) {
      // Session closed/expired — force sign out
      await supabase.auth.signOut();
      clearAllAuthStorage();
      useAuthStore.getState().setAuth(null, null);
      return;
    }
  } catch {
    // If heartbeat fails, allow through (network issue) but keep session
  }

  // Session is valid — load profile
  const profile = await fetchProfile(userId, userEmail, metadata);
  useAuthStore.getState().setAuth({ id: userId } as User, profile);
}

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user ?? null;
  if (user) {
    // For SIGNED_IN events (fresh login), profile is set by LoginPage after session-start
    // For TOKEN_REFRESHED or INITIAL_SESSION, validate the tracked session
    if (event === 'SIGNED_IN') {
      // Fresh login — profile will be set by login flow calling setAuth
      // Only set if not already authenticated (avoid re-triggering on token refresh)
      if (!useAuthStore.getState().isAuthenticated) {
        const profile = await fetchProfile(user.id, user.email, user.user_metadata);
        useAuthStore.getState().setAuth(user, profile);
      }
    } else if (event === 'TOKEN_REFRESHED') {
      // Token refreshed — just update user object
      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile) {
        useAuthStore.getState().setAuth(user, currentProfile);
      }
    }
  } else {
    useAuthStore.getState().setAuth(null, null);
  }
});

// Check initial session with validation
supabase.auth.getSession().then(async ({ data: { session } }) => {
  const user = session?.user ?? null;
  if (user) {
    await validateSessionOnInit(user.id, user.email, user.user_metadata);
  } else {
    clearAllAuthStorage();
    useAuthStore.getState().setAuth(null, null);
  }
});
