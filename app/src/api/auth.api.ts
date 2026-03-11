import client from './client';
import { LoginCredentials, AuthTokens } from '../types/auth.types';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
        const response = await client.post('/auth/login', credentials);
        return response.data;
    },
    refreshToken: async (token: string): Promise<AuthTokens> => {
        const response = await client.post('/auth/refresh', { refreshToken: token });
        return response.data;
    },
    logout: async (): Promise<void> => {
        await client.post('/auth/logout');
    },
};
