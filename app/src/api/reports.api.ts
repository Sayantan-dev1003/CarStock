import client from './client';
import { ApiResponse } from '../types/api.types';

export const reportsApi = {
  getDashboard: async (): Promise<any> => {
    const response = await client.get<ApiResponse<any>>('/reports/dashboard');
    return response.data.data;
  },

  generateReport: async (type: string, date?: string): Promise<{ message: string; pdfUrl: string }> => {
    const response = await client.post<ApiResponse<{ message: string; pdfUrl: string }>>('/reports/generate', {
      type,
      date,
    });
    return response.data.data;
  },
};
