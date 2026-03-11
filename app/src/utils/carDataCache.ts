import { vehiclesApi } from '../api/vehicles.api';
import { storage } from './storage';

export async function getCarData(): Promise<Record<string, string[]>> {
    // Step 1: Check if fresh cache exists
    const isFresh = await storage.isCarDataFresh();
    if (isFresh) {
        const cached = await storage.getCarData();
        if (cached) return cached;
    }

    // Step 2: Fetch from backend
    try {
        const data = await vehiclesApi.getCarData();

        // Step 3: Cache with timestamp
        await storage.setCarData(data);

        return data;
    } catch (error) {
        console.error('Error fetching car data:', error);
        // Return empty object as fallback or last known cache
        const lastCache = await storage.getCarData();
        return lastCache || {};
    }
}

export async function getMakesArray(): Promise<string[]> {
    const data = await getCarData();
    return Object.keys(data).sort();
}

export async function getModelsForMake(make: string): Promise<string[]> {
    const data = await getCarData();
    return data[make] || [];
}
