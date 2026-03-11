import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            isAuthenticated: false,
            isPinVerified: false,
            admin: null,

            setTokens: async (access: string, refresh: string) => {
                await AsyncStorage.setItem('accessToken', access);
                await AsyncStorage.setItem('refreshToken', refresh);
                set({ accessToken: access, isAuthenticated: true });
            },

            setAdmin: (admin: AdminProfile) => {
                set({ admin });
            },

            setPinVerified: (verified: boolean) => {
                set({ isPinVerified: verified });
            },

            clearAuth: async () => {
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                set({
                    accessToken: null,
                    isAuthenticated: false,
                    isPinVerified: false,
                    admin: null,
                });
            },

            loadStoredTokens: async () => {
                const token = await AsyncStorage.getItem('accessToken');
                if (token) {
                    set({ accessToken: token, isAuthenticated: true });
                    return true;
                }
                return false;
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                admin: state.admin,
            }),
        }
    )
);
