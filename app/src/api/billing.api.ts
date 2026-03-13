import client from './client';
import { Bill, CreateBillPayload } from '../types/billing.types';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

export const billingApi = {
  createBill: async (payload: CreateBillPayload): Promise<Bill> => {
    const response = await client.post<ApiResponse<Bill>>('/bills', payload);
    return response.data.data;
  },

  getBills: async (
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResponse<Bill>> => {
    const response = await client.get<ApiResponse<PaginatedResponse<Bill>>>('/bills', {
      params: { page, limit, startDate, endDate },
    });
    return response.data.data;
  },

  getBill: async (id: string): Promise<Bill> => {
    const response = await client.get<ApiResponse<Bill>>(`/bills/${id}`);
    return response.data.data;
  },

  resendBill: async (id: string): Promise<{ message: string; billId: string }> => {
    const response = await client.post<ApiResponse<{ message: string; billId: string }>>(`/bills/${id}/resend`);
    return response.data.data;
  },

  getCustomerBills: async (customerId: string, page: number, limit: number): Promise<PaginatedResponse<Bill>> => {
    const response = await client.get<ApiResponse<PaginatedResponse<Bill>>>(`/bills/customer/${customerId}`, {
      params: { page, limit },
    });
    return response.data.data;
  },
};
