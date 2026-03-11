import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricResult {
    success: boolean;
    error?: string;
}

export function useBiometric() {
    const checkAvailability = async (): Promise<boolean> => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    };

    const authenticate = async (): Promise<BiometricResult> => {
        try {
            const isAvailable = await checkAvailability();
            if (!isAvailable) {
                return { success: true }; // Skip if not available
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Verify your identity to access CarStock Admin',
                fallbackLabel: 'Use PIN',
                disableDeviceFallback: false,
            });

            if (result.success) {
                return { success: true };
            }

            return {
                success: false,
                error: result.error ?? 'Authentication failed',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message ?? 'An error occurred during authentication',
            };
        }
    };

    return { checkAvailability, authenticate };
}
