import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radius } from '../theme';

interface BadgeProps {
    label: string;
    color?: string;
    style?: ViewStyle;
    size?: 'sm' | 'md';
}

export default function Badge({
    label,
    color = '#FF6B00',
    style,
    size = 'md',
}: BadgeProps) {
    return (
        <View
            style={[
                styles.base,
                size === 'sm' && styles.sm,
                { backgroundColor: color + '20', borderColor: color + '50' },
                style,
            ]}
        >
            <Text style={[styles.text, size === 'sm' && styles.textSm, { color }]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.sm,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    sm: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    text: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    textSm: {
        fontSize: 10,
    },
});