import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  PIN: 'adminPin',
  CAR_DATA_CACHE: 'carDataCache',
  CAR_DATA_TIMESTAMP: 'carDataTimestamp',
} as const;

export const storage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  },
  async setAccessToken(token: string): Promise<void> {
    return AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  },
  async setRefreshToken(token: string): Promise<void> {
    return AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
  },
  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(KEYS.REFRESH_TOKEN);
  },
  async getPin(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.PIN);
  },
  async setPin(pin: string): Promise<void> {
    return AsyncStorage.setItem(KEYS.PIN, pin);
  },
  async getCarData(): Promise<Record<string, string[]> | null> {
    const data = await AsyncStorage.getItem(KEYS.CAR_DATA_CACHE);
    return data ? JSON.parse(data) : null;
  },
  async setCarData(data: Record<string, string[]>): Promise<void> {
    await AsyncStorage.setItem(KEYS.CAR_DATA_CACHE, JSON.stringify(data));
    await AsyncStorage.setItem(KEYS.CAR_DATA_TIMESTAMP, Date.now().toString());
  },
  async isCarDataFresh(): Promise<boolean> {
    const timestamp = await AsyncStorage.getItem(KEYS.CAR_DATA_TIMESTAMP);
    if (!timestamp) return false;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return parseInt(timestamp) > sevenDaysAgo;
  },
};
