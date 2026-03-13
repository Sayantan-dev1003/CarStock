import client from './client';
import { Customer, MobileLookupResult } from '../types/customer.types';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

export const customersApi = {
  lookupByMobile: async (mobile: string): Promise<MobileLookupResult> => {
    const response = await client.get<ApiResponse<MobileLookupResult>>(`/customers/mobile/${mobile}`);
    return response.data.data;
  },

  getCustomers: async (page: number, limit: number, search?: string): Promise<PaginatedResponse<Customer>> => {
    const response = await client.get<ApiResponse<PaginatedResponse<Customer>>>('/customers', {
      params: { page, limit, search },
    });
    return response.data.data;
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const response = await client.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await client.post<ApiResponse<Customer>>('/customers', data);
    return response.data.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await client.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data;
  },

  sendReminder: async (customerId: string): Promise<{ sent: boolean; emailSent: boolean; whatsappSent: boolean }> => {
    const response = await client.post<ApiResponse<{ sent: boolean; emailSent: boolean; whatsappSent: boolean }>>(
      `/reminders/customer/${customerId}`
    );
    return response.data.data;
  },
};
