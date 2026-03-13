import client from './client';
import { ApiResponse } from '../types/api.types';

export const notificationsApi = {
  registerToken: async (deviceToken: string): Promise<void> => {
    await client.post('/notifications/register-token', { deviceToken });
  },

  testPush: async (): Promise<void> => {
    await client.post('/notifications/test-push');
  },
};
