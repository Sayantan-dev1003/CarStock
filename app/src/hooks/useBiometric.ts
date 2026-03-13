import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricResult {
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
    const available = await checkAvailability();
    if (!available) {
      return { success: true }; // Allow access if biometrics not available
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity to access CarStock Admin',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  return { checkAvailability, authenticate };
}
