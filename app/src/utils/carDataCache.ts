import { storage } from './storage';
import { vehiclesApi } from '../api/vehicles.api';

export const carDataCache = {
  async getCarData(): Promise<Record<string, string[]>> {
    const isFresh = await storage.isCarDataFresh();
    const cachedData = await storage.getCarData();

    if (isFresh && cachedData) {
      return cachedData;
    }

    try {
      const freshData = await vehiclesApi.getCarData();
      await storage.setCarData(freshData);
      return freshData;
    } catch (error) {
      console.error('Failed to fetch car data:', error);
      return cachedData || {};
    }
  },

  async getMakesArray(): Promise<string[]> {
    const data = await this.getCarData();
    return Object.keys(data).sort();
  },

  async getModelsForMake(make: string): Promise<string[]> {
    const data = await this.getCarData();
    return data[make] || [];
  },
};
