import client from './client';
import { Vehicle } from '../types/customer.types';

export const vehiclesApi = {
    addVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
        const response = await client.post('/vehicles', data);
        return response.data;
    },
    getCustomerVehicles: async (customerId: string): Promise<Vehicle[]> => {
        const response = await client.get(`/vehicles/customer/${customerId}`);
        return response.data;
    },
    getCarData: async (): Promise<Record<string, string[]>> => {
        const response = await client.get('/vehicles/car-data');
        return response.data;
    },
    updateVehicle: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
        const response = await client.patch(`/vehicles/${id}`, data);
        return response.data;
    },
    removeVehicle: async (id: string): Promise<void> => {
        await client.delete(`/vehicles/${id}`);
    },
};
