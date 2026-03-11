import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppState(
    onBackground: () => void,
    onForeground: () => void,
    lockAfterSeconds: number = 300
) {
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const lastBackgroundTime = useRef<number | null>(null);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App has come to the foreground
                if (lastBackgroundTime.current) {
                    const elapsedSeconds = (Date.now() - lastBackgroundTime.current) / 1000;
                    if (elapsedSeconds > lockAfterSeconds) {
                        onForeground(); // Trigger lock if limit exceeded
                    }
                }
            }

            if (nextAppState.match(/inactive|background/)) {
                // App has gone to the background
                lastBackgroundTime.current = Date.now();
                onBackground();
            }

            appState.current = nextAppState;
            setAppStateVisible(appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, [onBackground, onForeground, lockAfterSeconds]);

    return { appStateVisible };
}
