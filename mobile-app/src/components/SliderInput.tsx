import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

interface SliderInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    icon?: keyof typeof Ionicons.glyphMap;
}

export default function SliderInput({
    label,
    value,
    onChange,
    min = 1,
    max = 10,
    icon = 'flash-outline',
}: SliderInputProps) {
    function getColor(v: number): string {
        if (v <= 3) return colors.success;
        if (v <= 6) return colors.warning;
        return colors.error;
    }

    const color = getColor(value);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.labelRow}>
                    <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={14} color={color} />
                    </View>
                    <Text style={styles.label}>{label}</Text>
                </View>
                <View style={[styles.valueBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.valueText, { color }]}>{value}</Text>
                    <Text style={styles.valueMax}>/10</Text>
                </View>
            </View>

            <Slider
                style={styles.slider}
                minimumValue={min}
                maximumValue={max}
                step={1}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor={color}
                maximumTrackTintColor={colors.border}
                thumbTintColor={color}
            />

            <View style={styles.marks}>
                <Text style={styles.mark}>Leve</Text>
                <Text style={styles.mark}>Moderado</Text>
                <Text style={styles.mark}>Máximo</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconWrap: {
        width: 26,
        height: 26,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    valueBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.sm,
        gap: 1,
    },
    valueText: {
        fontSize: 18,
        fontWeight: '800',
    },
    valueMax: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '600',
    },
    slider: {
        width: '100%',
        height: 36,
    },
    marks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mark: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '500',
    },
});