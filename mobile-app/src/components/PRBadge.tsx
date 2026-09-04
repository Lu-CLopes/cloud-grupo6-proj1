import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

interface PRBadgeProps {
    weight: number;
    isNew?: boolean;
}

export default function PRBadge({ weight, isNew = false }: PRBadgeProps) {
    return (
        <View style={[styles.container, isNew && styles.newContainer]}>
            <Ionicons
                name="trophy"
                size={isNew ? 14 : 12}
                color={colors.prGold}
            />
            <Text style={[styles.weight, isNew && styles.newWeight]}>
                {weight} lb
            </Text>
            {isNew && <Text style={styles.newLabel}>NOVO PR</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.prGoldFade,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.prGold + '40',
    },
    newContainer: {
        backgroundColor: colors.prGold + '25',
        borderColor: colors.prGold,
        paddingVertical: 6,
    },
    weight: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.prGold,
    },
    newWeight: {
        fontSize: 15,
    },
    newLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: colors.prGold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});