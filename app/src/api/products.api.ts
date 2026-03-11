import client from './client';
import {
    Product,
    ProductSearchResult,
    LowStockProduct,
    PaginatedProducts,
} from '../types/product.types';

export const productsApi = {
    searchProducts: async (query: string): Promise<ProductSearchResult[]> => {
        const response = await client.get(`/products/search?q=${query}`);
        return response.data;
    },
    getProducts: async ({
        page,
        limit,
        category,
    }: {
        page: number;
        limit: number;
        category?: string;
    }): Promise<PaginatedProducts> => {
        const response = await client.get('/products', {
            params: { page, limit, category },
        });
        return response.data;
    },
    getProduct: async (id: string): Promise<Product & { stockLogs: any[] }> => {
        const response = await client.get(`/products/${id}`);
        return response.data;
    },
    getLowStockProducts: async (): Promise<LowStockProduct[]> => {
        const response = await client.get('/products/low-stock');
        return response.data;
    },
    createProduct: async (data: Partial<Product>): Promise<Product> => {
        const response = await client.post('/products', data);
        return response.data;
    },
    updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
        const response = await client.patch(`/products/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id: string): Promise<{ message: string }> => {
        const response = await client.delete(`/products/${id}`);
        return response.data;
    },
};
