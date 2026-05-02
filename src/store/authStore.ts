import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'seeker' | 'coach';
  admin_level?: string | null;
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

// Session id storage: mirrors the supabase auth storage selection
// (sessionStorage by default, localStorage if "Remember me" was checked).
const SESSION_ID_KEY = 'vdts_session_id';
const REMEMBER_FLAG = 'vdts_remember_me';

function sessionIdStore(): Storage {
  try {
    const remember = localStorage.getItem(REMEMBER_FLAG) === '1';
    return remember ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
}

export function getStoredSessionId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_ID_KEY) || localStorage.getItem(SESSION_ID_KEY);
  } catch {
    return null;
  }
}

function writeSessionId(id: string | null) {
  try {
    if (id) {
      sessionIdStore().setItem(SESSION_ID_KEY, id);
      // Clear the other storage to avoid stale ids
      const other = sessionIdStore() === localStorage ? sessionStorage : localStorage;
      other.removeItem(SESSION_ID_KEY);
    } else {
      localStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
    }
  } catch { /* ignore */ }
}

function clearAllAuthStorage() {
  [localStorage, sessionStorage].forEach((store) => {
    try {
      Object.keys(store).forEach((key) => {
        if (key.startsWith('sb-')) store.removeItem(key);
      });
      store.removeItem(SESSION_ID_KEY);
    } catch { /* ignore */ }
  });
}

let _initialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  profile: null,
  sessionId: getStoredSessionId(),
  darkMode: false,
  loading: true,
  setAuth: (user, profile) => set({
    isAuthenticated: !!user,
    user,
    profile,
    loading: false,
  }),
  setSessionId: (id) => {
    writeSessionId(id);
    set({ sessionId: id });
  },
  logout: async () => {
    const { sessionId } = get();
    if (sessionId) {
      try {
        // Grab access token BEFORE signOut clears it
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (accessToken) {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-heartbeat`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ action: 'end', session_id: sessionId }),
            }
          );
        }
      } catch { /* ignore */ }
    }
    await supabase.auth.signOut();
    clearAllAuthStorage();
    try { localStorage.removeItem(REMEMBER_FLAG); } catch { /* ignore */ }
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
    .select('id, user_id, email, full_name, role, admin_level')
    .eq('user_id', userId)
    .maybeSingle();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 3000)
  );

  try {
    const { data } = await Promise.race([profilePromise, timeoutPromise]) as any;
    return data as Profile | null;
  } catch {
    // SECURITY: Never trust user_metadata.role — users can self-set it via
    // supabase.auth.updateUser({ data: { role: 'admin' } }). Always default
    // to the lowest-privilege role on fallback. RLS still protects data,
    // but UI routes must not be elevated based on client-controllable data.
    console.warn('Profile fetch timed out — defaulting to seeker role');
    return {
      id: userId,
      user_id: userId,
      email: userEmail || '',
      full_name: metadata?.full_name || userEmail || '',
      role: 'seeker',
    } as Profile;
  }
}

async function validateSessionOnInit(userId: string, accessToken: string, userEmail?: string, metadata?: any) {
  const storedSessionId = getStoredSessionId();

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

    // 5xx = edge runtime transient error → allow through, don't sign out
    if (response.status >= 500) {
      console.warn('Heartbeat 5xx — allowing session through');
    } else {
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.active) {
        if (
          response.status === 401 ||
          data?.reason === 'invalid_token' ||
          data?.reason === 'fingerprint_mismatch' ||
          data?.active === false
        ) {
          await supabase.auth.signOut();
          clearAllAuthStorage();
          useAuthStore.getState().setAuth(null, null);
          return;
        }
      }
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
const _skipInitValidation =
  window.location.pathname === '/login' ||
  window.location.pathname === '/reset-password';

if (_skipInitValidation) {
  // Login & reset-password — do NOT touch the session.
  // On /reset-password, Supabase has just established a recovery session
  // from the URL hash; validating/sign-out here would destroy it.
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
  }).catch(() => {
    // e.g. "Invalid Refresh Token: Refresh Token Not Found" — clear & continue
    clearAllAuthStorage();
    useAuthStore.getState().setAuth(null, null);
    _initialized = true;
  });
}
