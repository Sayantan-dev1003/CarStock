import client from './client';

export const inventoryApi = {
  addStock: async (data: { productId: string; quantity: number; note?: string }): Promise<void> => {
    await client.post('/inventory/add-stock', data);
  },

  getStockHistory: async (productId: string, page: number, limit: number): Promise<any> => {
    const response = await client.get(`/inventory/stock-history/${productId}`, {
      params: { page, limit },
    });
    return response.data ?? [];
  },

  getInventorySummary: async (): Promise<any> => {
    const response = await client.get('/inventory/summary');
    return response.data ?? {};
  },
};