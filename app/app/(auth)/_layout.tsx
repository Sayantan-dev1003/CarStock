import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.dark },
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="pin" />
        </Stack>
    );
}
