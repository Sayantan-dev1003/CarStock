import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OfflineBanner: React.FC = () => {
  const isOffline = useSharedValue(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      isOffline.value = !state.isConnected;
    });

    return () => unsubscribe();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: isOffline.value ? 0 : -100,
      paddingTop: insets.top + theme.spacing.xs,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    paddingBottom: theme.spacing.xs,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: 'white',
    fontSize: 13,
    fontFamily: theme.font.body,
    fontWeight: '600',
  },
});
