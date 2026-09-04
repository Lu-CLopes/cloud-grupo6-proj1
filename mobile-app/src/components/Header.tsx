import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

interface HeaderProps {
    title: string;
    subtitle?: string;
    rightAction?: {
        label: string;
        onPress: () => void;
    };
}

export default function Header({ title, subtitle, rightAction }: HeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {rightAction && (
                <TouchableOpacity
                    style={styles.action}
                    onPress={rightAction.onPress}
                >
                    <Text style={styles.actionText}>{rightAction.label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    left: { flex: 1 },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    action: {
        backgroundColor: colors.orange,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 20,
    },
    actionText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
});