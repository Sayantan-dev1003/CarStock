import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    PIN: 'adminPin',
    CAR_DATA_CACHE: 'carDataCache',
    CAR_DATA_TIMESTAMP: 'carDataTimestamp',
} as const;

export const storage = {
    getAccessToken: async (): Promise<string | null> => {
        return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    },
    setAccessToken: async (token: string): Promise<void> => {
        await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
    },

    getRefreshToken: async (): Promise<string | null> => {
        return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    },
    setRefreshToken: async (token: string): Promise<void> => {
        await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
    },

    clearTokens: async (): Promise<void> => {
        await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
        await AsyncStorage.removeItem(KEYS.REFRESH_TOKEN);
    },

    getPin: async (): Promise<string | null> => {
        return AsyncStorage.getItem(KEYS.PIN);
    },
    setPin: async (pin: string): Promise<void> => {
        await AsyncStorage.setItem(KEYS.PIN, pin);
    },

    getCarData: async (): Promise<Record<string, string[]> | null> => {
        const data = await AsyncStorage.getItem(KEYS.CAR_DATA_CACHE);
        return data ? JSON.parse(data) : null;
    },
    setCarData: async (data: Record<string, string[]>): Promise<void> => {
        await AsyncStorage.setItem(KEYS.CAR_DATA_CACHE, JSON.stringify(data));
        await AsyncStorage.setItem(KEYS.CAR_DATA_TIMESTAMP, Date.now().toString());
    },
    isCarDataFresh: async (): Promise<boolean> => {
        const timestamp = await AsyncStorage.getItem(KEYS.CAR_DATA_TIMESTAMP);
        if (!timestamp) return false;

        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const isFresh = Date.now() - parseInt(timestamp, 10) < sevenDaysInMs;
        return isFresh;
    },
};
