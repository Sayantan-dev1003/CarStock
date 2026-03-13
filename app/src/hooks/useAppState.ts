import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppState(onForeground: () => void) {
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number | null>(null);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (backgroundTimestamp.current) {
          const fiveMinutes = 5 * 60 * 1000;
          if (Date.now() - backgroundTimestamp.current > fiveMinutes) {
            onForeground();
          }
        }
        backgroundTimestamp.current = null;
      }

      if (nextAppState.match(/inactive|background/)) {
        backgroundTimestamp.current = Date.now();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [onForeground]);
}
