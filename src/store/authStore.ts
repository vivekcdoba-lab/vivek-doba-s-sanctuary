import { create } from 'zustand';
import { UserRole } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; role: UserRole } | null;
  darkMode: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  toggleDarkMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  darkMode: false,
  login: (email, role) => set({
    isAuthenticated: true,
    user: {
      id: role === 'admin' ? 'admin-1' : 's1',
      email,
      name: role === 'admin' ? 'Vivek Doba' : 'Rahul Patil',
      role,
    },
  }),
  logout: () => set({ isAuthenticated: false, user: null }),
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    document.documentElement.classList.toggle('dark', newMode);
    return { darkMode: newMode };
  }),
}));
