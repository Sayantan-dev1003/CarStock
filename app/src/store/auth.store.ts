import { create } from 'zustand';
import { storage } from '../utils/storage';
import { AdminProfile } from '../types/auth.types';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isPinVerified: boolean;
  admin: AdminProfile | null;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setAdmin: (admin: AdminProfile) => void;
  setPinVerified: (verified: boolean) => void;
  clearAuth: () => Promise<void>;
  loadStoredTokens: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  isAuthenticated: false,
  isPinVerified: false,
  admin: null,

  setTokens: async (access, refresh) => {
    await storage.setAccessToken(access);
    await storage.setRefreshToken(refresh);
    set({ accessToken: access, isAuthenticated: true });
  },

  setAdmin: (admin) => set({ admin }),

  setPinVerified: (verified) => set({ isPinVerified: verified }),

  clearAuth: async () => {
    await storage.clearTokens();
    set({ accessToken: null, isAuthenticated: false, admin: null, isPinVerified: false });
  },

  loadStoredTokens: async () => {
    const token = await storage.getAccessToken();
    if (token) {
      set({ accessToken: token, isAuthenticated: true });
      return true;
    }
    return false;
  },
}));
