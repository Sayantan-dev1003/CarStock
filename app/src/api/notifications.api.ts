import client from './client';

export const notificationsApi = {
    registerToken: async (deviceToken: string): Promise<{ message: string }> => {
        const response = await client.post('/notifications/register-token', { deviceToken });
        return response.data;
    },
    testPush: async (): Promise<{ sent: boolean; message: string }> => {
        const response = await client.post('/notifications/test-push');
        return response.data;
    },
};
