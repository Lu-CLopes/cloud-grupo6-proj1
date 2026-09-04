import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'purple';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    icon?: keyof typeof Ionicons.glyphMap;
    fullWidth?: boolean;
}

export default function Button({
    label,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    icon,
    fullWidth = true,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const variantStyle = {
        primary: styles.primary,
        secondary: styles.secondary,
        ghost: styles.ghost,
        danger: styles.danger,
        purple: styles.purple,
    }[variant];

    const labelStyle = {
        primary: styles.labelPrimary,
        secondary: styles.labelSecondary,
        ghost: styles.labelGhost,
        danger: styles.labelDanger,
        purple: styles.labelPurple,
    }[variant];

    const iconColor = {
        primary: colors.white,
        secondary: colors.orange,
        ghost: colors.textSecondary,
        danger: colors.white,
        purple: colors.white,
    }[variant];

    const shadowStyle =
        variant === 'primary' ? shadow.orange :
            variant === 'purple' ? shadow.purple :
                undefined;

    return (
        <TouchableOpacity
            style={[
                styles.base,
                variantStyle,
                shadowStyle,
                !fullWidth && styles.inline,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'purple' || variant === 'danger'
                        ? colors.white
                        : colors.orange}
                    size="small"
                />
            ) : (
                <View style={styles.content}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={18}
                            color={iconColor}
                            style={styles.icon}
                        />
                    )}
                    <Text style={[styles.label, labelStyle]}>{label}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inline: {
        alignSelf: 'flex-start',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },

    // Variants
    primary: {
        backgroundColor: colors.orange,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.orange,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: colors.error,
    },
    purple: {
        backgroundColor: colors.purple,
    },
    disabled: {
        opacity: 0.38,
    },

    // Labels
    label: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    labelPrimary: { color: colors.white },
    labelSecondary: { color: colors.orange },
    labelGhost: { color: colors.textSecondary },
    labelDanger: { color: colors.white },
    labelPurple: { color: colors.white },
});