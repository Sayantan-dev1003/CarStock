import client from './client';
import {
  Product,
  ProductCategory,
  ProductSearchResult,
  LowStockProduct,
  PaginatedProducts,
} from '../types/product.types';
import { ApiResponse } from '../types/api.types';

export const productsApi = {
  searchProducts: async (query: string): Promise<ProductSearchResult[]> => {
    const response = await client.get<ApiResponse<ProductSearchResult[]>>(`/products/search?q=${query}`);
    return response.data.data;
  },

  getProducts: async (page: number, limit: number, category?: ProductCategory): Promise<PaginatedProducts> => {
    const response = await client.get<ApiResponse<PaginatedProducts>>('/products', {
      params: { page, limit, category },
    });
    return response.data.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await client.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  getLowStockProducts: async (): Promise<LowStockProduct[]> => {
    const response = await client.get<ApiResponse<LowStockProduct[]>>('/products/low-stock');
    return response.data.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await client.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await client.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const response = await client.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
    return response.data.data;
  },
};
