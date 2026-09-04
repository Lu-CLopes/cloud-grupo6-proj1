import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'highlighted' | 'orange' | 'purple' | 'dark';
    noPadding?: boolean;
}

export default function Card({
    children,
    style,
    variant = 'default',
    noPadding = false,
}: CardProps) {
    return (
        <View
            style={[
                styles.base,
                !noPadding && styles.padding,
                styles[variant],
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.card,
    },
    padding: {
        padding: 16,
    },
    default: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
    },
    highlighted: {
        backgroundColor: colors.surface,
        borderColor: colors.orange,
        borderWidth: 1.5,
    },
    orange: {
        backgroundColor: colors.orangeFade,
        borderColor: colors.orange,
        borderWidth: 1.5,
    },
    purple: {
        backgroundColor: colors.purpleFade,
        borderColor: colors.purple,
        borderWidth: 1.5,
    },
    dark: {
        backgroundColor: colors.surfaceLight,
        borderColor: 'transparent',
    },
});