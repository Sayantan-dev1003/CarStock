import client from './client';
import { Customer, MobileLookupResult } from '../types/customer.types';
import { PaginatedResponse } from '../types/api.types';

export const customersApi = {
  lookupByMobile: async (mobile: string): Promise<MobileLookupResult> => {
    const response = await client.get(`/customers/mobile/${mobile}`);
    return response.data;
  },

  getCustomers: async (page: number, limit: number, search?: string): Promise<PaginatedResponse<Customer>> => {
    const response = await client.get('/customers', {
      params: { page, limit, search },
    });
    return response.data ?? { data: [], total: 0, page: 1, limit: 10 };
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const response = await client.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await client.post('/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await client.patch(`/customers/${id}`, data);
    return response.data;
  },

  sendReminder: async (customerId: string): Promise<{ sent: boolean; emailSent: boolean; whatsappSent: boolean }> => {
    const response = await client.post(`/reminders/customer/${customerId}`);
    return response.data;
  },
};