import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: string | number;
    label: string;
    color?: string;
    accent?: boolean;
}

export default function StatCard({
    icon,
    value,
    label,
    color = colors.orange,
    accent = false,
}: StatCardProps) {
    return (
        <View
            style={[
                styles.container,
                accent && { borderColor: color, borderWidth: 1.5 },
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={[styles.value, { color }]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: 3,
        ...shadow.card,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    value: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.8,
        lineHeight: 30,
    },
    label: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '600',
        marginTop: 3,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
});