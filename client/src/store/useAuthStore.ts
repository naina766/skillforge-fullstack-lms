import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  setInitializing: (isInitializing: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitializing: true,
      setAuth: (user: User, accessToken: string) =>
        set({ user, accessToken, isAuthenticated: true, isInitializing: false }),
      setAccessToken: (accessToken: string) =>
        set({ accessToken }),
      setUser: (user: User) =>
        set({ user, isAuthenticated: true }),
      setInitializing: (isInitializing: boolean) =>
        set({ isInitializing }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false }),
    }),
    {
      name: 'skillforge-auth',
      // Access token is kept strictly in MEMORY ONLY for XSS resilience (never saved to localStorage)
      partialize: (state) => ({ user: state.user }),
    }
  )
);

