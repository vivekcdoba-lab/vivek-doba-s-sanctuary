import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'seeker' | 'coach';
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

let _initialized = false;

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

// Helpers
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

async function validateSessionOnInit(userId: string, accessToken: string, userEmail?: string, metadata?: any) {
  const storedSessionId = localStorage.getItem('vdts_session_id');

  if (!storedSessionId) {
    await supabase.auth.signOut();
    clearAllAuthStorage();
    useAuthStore.getState().setAuth(null, null);
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-heartbeat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: 'heartbeat', session_id: storedSessionId }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.active) {
      await supabase.auth.signOut();
      clearAllAuthStorage();
      useAuthStore.getState().setAuth(null, null);
      return;
    }
  } catch {
    // Network issue — allow through
  }

  const profile = await fetchProfile(userId, userEmail, metadata);
  useAuthStore.getState().setAuth({ id: userId } as User, profile);
}

// Auth state change listener — gated behind _initialized to prevent flicker
supabase.auth.onAuthStateChange(async (event, session) => {
  if (!_initialized) return;

  const user = session?.user ?? null;
  if (user) {
    if (event === 'SIGNED_IN') {
      // LoginPage handles setAuth + session start + setSessionId
    } else if (event === 'TOKEN_REFRESHED') {
      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile) {
        useAuthStore.getState().setAuth(user, currentProfile);
      }
    }
  } else {
    useAuthStore.getState().setAuth(null, null);
  }
});

// Initial session check
if (window.location.pathname === '/login') {
  // Login page — render immediately, no async wait
  _initialized = true;
  useAuthStore.setState({ loading: false });
} else {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    const user = session?.user ?? null;
    if (user) {
      await validateSessionOnInit(user.id, session!.access_token, user.email, user.user_metadata);
    } else {
      clearAllAuthStorage();
      useAuthStore.getState().setAuth(null, null);
    }
    _initialized = true;
  });
}
