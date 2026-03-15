import { create } from 'zustand';
import { storage } from '../utils/storage';
import { AdminProfile } from '../types/auth.types';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isPinVerified: boolean;
  admin: AdminProfile | null;
  setTokens: (access: string, refresh: string, admin: AdminProfile) => Promise<void>;
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

  setTokens: async (access, refresh, admin) => {
    await storage.setAccessToken(access);
    await storage.setRefreshToken(refresh);
    if (admin) {
      await storage.setAdminProfile(admin);
      set({ admin });
    }
    set({ accessToken: access, isAuthenticated: true });
    
    const bioEnabled = await storage.getBiometricsEnabled();
    if (!bioEnabled) {
      set({ isPinVerified: true });
    }
  },

  setAdmin: (admin) => set({ admin }),

  setPinVerified: (verified) => set({ isPinVerified: verified }),

  clearAuth: async () => {
    await storage.clearTokens();
    set({ accessToken: null, isAuthenticated: false, admin: null, isPinVerified: false });
  },

  loadStoredTokens: async () => {
    const token = await storage.getAccessToken();
    const admin = await storage.getAdminProfile();
    if (token) {
      set({ accessToken: token, isAuthenticated: true, admin });
      
      const bioEnabled = await storage.getBiometricsEnabled();
      if (!bioEnabled) {
        set({ isPinVerified: true });
      }
      return true;
    }
    return false;
  },
}));
