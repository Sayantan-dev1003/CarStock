import client from './client';
import { Bill, CreateBillPayload } from '../types/billing.types';
import { PaginatedResponse } from '../types/api.types';

export const billingApi = {
  createBill: async (payload: CreateBillPayload): Promise<Bill> => {
    const response = await client.post('/bills', payload);
    return response.data;
  },

  getBills: async (
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<PaginatedResponse<Bill>> => {
    const response = await client.get('/bills', {
      params: { page, limit, startDate, endDate, status },
    });
    return response.data ?? { data: [], total: 0, page: 1, limit: 10 };
  },

  getBill: async (id: string): Promise<Bill> => {
    const response = await client.get(`/bills/${id}`);
    return response.data;
  },

  resendBill: async (id: string): Promise<{ message: string; billId: string }> => {
    const response = await client.post(`/bills/${id}/resend`);
    return response.data;
  },

  getCustomerBills: async (customerId: string, page: number, limit: number): Promise<PaginatedResponse<Bill>> => {
    const response = await client.get(`/bills/customer/${customerId}`, {
      params: { page, limit },
    });
    return response.data ?? { data: [], total: 0, page: 1, limit: 10 };
  },
};