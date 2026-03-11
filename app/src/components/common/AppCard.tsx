import React, { ReactNode } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';

interface AppCardProps {
    children: ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    shadow?: 'sm' | 'md' | 'lg';
    padding?: number;
}

export const AppCard: React.FC<AppCardProps> = ({
    children,
    style,
    onPress,
    shadow = 'md',
    padding = Spacing.md,
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={[
                styles.card,
                Shadows[shadow],
                { padding },
                style,
            ]}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        marginVertical: Spacing.xs,
    },
});
