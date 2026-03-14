import client from './client';

export const reportsApi = {
  getDashboard: async (): Promise<any> => {
    const response = await client.get('/reports/dashboard');
    return response.data ?? {};
  },

  generateReport: async (type: string, date?: string): Promise<any> => {
    const response = await client.post('/reports/generate', { type, date });
    return response.data ?? {};
  },
};