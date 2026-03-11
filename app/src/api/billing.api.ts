import client from './client';
import { Bill, CreateBillPayload, BillDeliveryStatus } from '../types/billing.types';
import { PaginatedResponse } from '../types/api.types';

export const billingApi = {
    createBill: async (payload: CreateBillPayload): Promise<Bill & { deliveryStatus: BillDeliveryStatus }> => {
        const response = await client.post('/bills', payload);
        return response.data;
    },
    getBills: async ({
        page,
        limit,
        startDate,
        endDate,
    }: {
        page: number;
        limit: number;
        startDate?: string;
        endDate?: string;
    }): Promise<PaginatedResponse<Bill>> => {
        const response = await client.get('/bills', {
            params: { page, limit, startDate, endDate },
        });
        return response.data;
    },
    getBill: async (id: string): Promise<Bill> => {
        const response = await client.get(`/bills/${id}`);
        return response.data;
    },
    resendBill: async (id: string): Promise<{ message: string; billId: string }> => {
        const response = await client.post(`/bills/${id}/resend`);
        return response.data;
    },
    getCustomerBills: async (
        customerId: string,
        page: number,
        limit: number
    ): Promise<PaginatedResponse<Bill>> => {
        const response = await client.get(`/bills/customer/${customerId}`, {
            params: { page, limit },
        });
        return response.data;
    },
};
