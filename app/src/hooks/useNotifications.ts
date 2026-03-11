import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationsApi } from '../api/notifications.api';

export function useNotifications() {
    const setup = async (): Promise<void> => {
        try {
            // Step 1: Check if physical device
            if (!Device.isDevice) {
                console.warn('Push notifications are only available on physical devices');
                return;
            }

            // Step 2 & 3: Get/Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Push notification permission denied');
                return;
            }

            // Step 4: Get Expo push token
            const token = (await Notifications.getExpoPushTokenAsync()).data;

            // Step 5: Register token with backend
            await notificationsApi.registerToken(token);
            console.log('Push token registered:', token);

            // Step 6: Set up notification handler
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
        } catch (error) {
            console.error('Error setting up notifications:', error);
        }
    };

    return { setup };
}
