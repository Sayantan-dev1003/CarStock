import client from './client';
import { LoginCredentials, AuthTokens } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await client.post<ApiResponse<AuthTokens>>('/auth/login', credentials);
    return response.data.data;
  },

  refreshToken: async (token: string): Promise<AuthTokens> => {
    const response = await client.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken: token });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },
};
