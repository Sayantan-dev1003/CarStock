import client from './client';
import { ApiResponse } from '../types/api.types';

export const inventoryApi = {
  addStock: async (data: { productId: string; quantity: number; note?: string }): Promise<void> => {
    await client.post('/inventory/add-stock', data);
  },

  getStockHistory: async (productId: string, page: number, limit: number): Promise<any> => {
    const response = await client.get<ApiResponse<any>>(`/inventory/stock-history/${productId}`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  getInventorySummary: async (): Promise<any> => {
    const response = await client.get<ApiResponse<any>>('/inventory/summary');
    return response.data.data;
  },
};
