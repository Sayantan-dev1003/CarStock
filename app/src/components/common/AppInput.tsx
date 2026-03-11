import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardTypeOptions,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface AppInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    editable?: boolean;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines,
    maxLength,
    editable = true,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                    !editable && styles.inputDisabled,
                    multiline && styles.inputMultiline,
                ]}
            >
                {leftIcon && (
                    <MaterialCommunityIcons
                        name={leftIcon as any}
                        size={20}
                        color={isFocused ? Colors.primary : Colors.grey400}
                        style={styles.leftIcon}
                    />
                )}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.grey400}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    editable={editable}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={[
                        styles.input,
                        multiline && styles.inputMultilineText,
                        !editable && styles.textDisabled,
                    ]}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
                        <MaterialCommunityIcons
                            name={rightIcon as any}
                            size={20}
                            color={Colors.grey400}
                            style={styles.rightIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        width: '100%',
    },
    label: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.medium,
        color: Colors.grey600,
        marginBottom: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.grey200,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        minHeight: 48,
    },
    inputFocused: {
        borderColor: Colors.primary,
    },
    inputError: {
        borderColor: Colors.error,
    },
    inputDisabled: {
        backgroundColor: Colors.grey100,
        borderColor: Colors.grey200,
    },
    inputMultiline: {
        alignItems: 'flex-start',
        paddingVertical: Spacing.sm,
        minHeight: 100,
    },
    leftIcon: {
        marginRight: Spacing.xs,
    },
    rightIcon: {
        marginLeft: Spacing.xs,
    },
    input: {
        flex: 1,
        fontSize: Typography.fontSizes.base,
        color: Colors.dark,
        paddingVertical: Spacing.xs,
    },
    inputMultilineText: {
        textAlignVertical: 'top',
    },
    textDisabled: {
        color: Colors.grey500,
    },
    errorText: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.error,
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
    },
});
