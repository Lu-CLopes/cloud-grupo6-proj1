import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
    rightLabel?: string;
    onRightPress?: () => void;
    hideBack?: boolean;
    onBack?: () => void;
    accent?: 'orange' | 'purple';
}

export default function ScreenHeader({
    title,
    subtitle,
    rightIcon,
    rightLabel,
    onRightPress,
    hideBack = false,
    onBack,
    accent,
}: ScreenHeaderProps) {
    const navigation = useNavigation();
    const { colors } = useTheme();

    function handleBack() {
        onBack ? onBack() : navigation.goBack();
    }

    const accentColor =
        accent === 'orange' ? colors.orange :
            accent === 'purple' ? colors.purple :
                colors.orange;

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            {accent && (
                <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
            )}
            <View style={styles.row}>
                <View style={styles.side}>
                    {!hideBack && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={handleBack}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons name="chevron-back" size={20} color={colors.orange} />
                            <Text style={[styles.backLabel, { color: colors.orange }]}>
                                Voltar
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.center}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                <View style={[styles.side, styles.sideRight]}>
                    {rightIcon && onRightPress && (
                        <TouchableOpacity
                            style={styles.rightBtn}
                            onPress={onRightPress}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            {rightLabel && (
                                <Text style={[styles.rightLabel, { color: colors.orange }]}>
                                    {rightLabel}
                                </Text>
                            )}
                            <Ionicons name={rightIcon} size={22} color={colors.orange} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        paddingTop: Platform.OS === 'ios' ? 54 : 16,
    },
    accentLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    side: { width: 88, justifyContent: 'center' },
    sideRight: { alignItems: 'flex-end' },
    center: { flex: 1, alignItems: 'center' },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    backLabel: { fontSize: 15, fontWeight: '500' },
    title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
    subtitle: { fontSize: 11, marginTop: 1, textAlign: 'center' },
    rightBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rightLabel: { fontSize: 14, fontWeight: '600' },
});