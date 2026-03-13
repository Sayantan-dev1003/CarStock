import client from './client';
import { Vehicle } from '../types/customer.types';
import { ApiResponse } from '../types/api.types';

export const vehiclesApi = {
  addVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await client.post<ApiResponse<Vehicle>>('/vehicles', data);
    return response.data.data;
  },

  getCustomerVehicles: async (customerId: string): Promise<Vehicle[]> => {
    const response = await client.get<ApiResponse<Vehicle[]>>(`/vehicles/customer/${customerId}`);
    return response.data.data;
  },

  getCarData: async (): Promise<Record<string, string[]>> => {
    const response = await client.get<ApiResponse<Record<string, string[]>>>('/vehicles/car-data');
    return response.data.data;
  },

  updateVehicle: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await client.patch<ApiResponse<Vehicle>>(`/vehicles/${id}`, data);
    return response.data.data;
  },

  removeVehicle: async (id: string): Promise<void> => {
    await client.delete(`/vehicles/${id}`);
  },
};
