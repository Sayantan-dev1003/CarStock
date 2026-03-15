import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { Colors } from '../src/constants/theme';

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Small delay to show splash feel
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(app)/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
      </View>
      <Text style={styles.appName}>Ramadhani Car Accessories and Autocare</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'contain',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: 'Outfit_600SemiBold',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
    letterSpacing: -0.5,
  },
  loader: {
    marginTop: 10,
  },
});
