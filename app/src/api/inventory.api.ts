import client from './client';
import { Product, StockLog } from '../types/product.types';
import { PaginatedResponse } from '../types/api.types';

export const inventoryApi = {
    addStock: async (data: {
        productId: string;
        quantity: number;
        note?: string;
    }): Promise<Product> => {
        const response = await client.post('/inventory/add-stock', data);
        return response.data;
    },
    getStockHistory: async (
        productId: string,
        page: number,
        limit: number
    ): Promise<PaginatedResponse<StockLog>> => {
        const response = await client.get(`/inventory/stock-history/${productId}`, {
            params: { page, limit },
        });
        return response.data;
    },
    getInventorySummary: async (): Promise<any> => {
        const response = await client.get('/inventory/summary');
        return response.data;
    },
};
