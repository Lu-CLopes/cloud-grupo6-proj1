import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { colors, spacing, radius } from '../theme';

interface Option {
    label: string;
    value: string;
    color?: string;
}

interface SegmentedControlProps {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    scrollable?: boolean;
}

export default function SegmentedControl({
    label,
    options,
    value,
    onChange,
    scrollable = false,
}: SegmentedControlProps) {
    const Pills = (
        <>
            {options.map((opt) => {
                const isSelected = opt.value === value;
                const color = opt.color ?? colors.orange;
                return (
                    <TouchableOpacity
                        key={opt.value}
                        style={[
                            styles.pill,
                            isSelected && {
                                backgroundColor: color + '20',
                                borderColor: color,
                            },
                        ]}
                        onPress={() => onChange(opt.value)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.pillText,
                                { color: isSelected ? color : colors.textMuted },
                            ]}
                        >
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </>
    );

    return (
        <View style={styles.wrapper}>
            {label && <Text style={styles.label}>{label}</Text>}
            {scrollable ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.row}
                >
                    {Pills}
                </ScrollView>
            ) : (
                <View style={styles.row}>{Pills}</View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    pill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceLight,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
    },
});