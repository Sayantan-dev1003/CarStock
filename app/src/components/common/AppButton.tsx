import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: string;
    style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    style,
}) => {
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return { backgroundColor: Colors.primary };
            case 'secondary':
                return { backgroundColor: Colors.dark };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: Colors.primary,
                };
            case 'danger':
                return { backgroundColor: Colors.errorLight };
            default:
                return { backgroundColor: Colors.primary };
        }
    };

    const getTextStyles = (): TextStyle => {
        switch (variant) {
            case 'outline':
                return { color: Colors.primary };
            case 'danger':
                return { color: Colors.error };
            default:
                return { color: Colors.white };
        }
    };

    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'sm':
                return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md };
            case 'lg':
                return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl };
            default:
                return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg };
        }
    };

    const getFontSize = (): number => {
        switch (size) {
            case 'sm':
                return Typography.fontSizes.sm;
            case 'lg':
                return Typography.fontSizes.md;
            default:
                return Typography.fontSizes.base;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                getVariantStyles(),
                getSizeStyles(),
                fullWidth && styles.fullWidth,
                (disabled || loading) && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'danger' ? Colors.primary : Colors.white} />
            ) : (
                <>
                    {icon && (
                        <MaterialCommunityIcons
                            name={icon as any}
                            size={getFontSize() + 2}
                            color={getTextStyles().color}
                            style={styles.icon}
                        />
                    )}
                    <Text
                        style={[
                            styles.text,
                            getTextStyles(),
                            { fontSize: getFontSize() },
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontWeight: Typography.fontWeights.semibold,
    },
    icon: {
        marginRight: Spacing.xs,
    },
});
