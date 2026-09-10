import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, radius, shadow } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { useWodStore, WodEntry } from '../store/useWodStore';
import { useExerciseStore, ExerciseEntry } from '../store/useExerciseStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatDate, getGreeting, formatShortDate, toDateOnly } from '../utils/formatters';
import { RootStackParamList } from '../navigation/types';

import { fetchHistory } from '../services/api/historyApi';

import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

type NavProp = StackNavigationProp<RootStackParamList>;

const TYPE_COLORS: Record<string, string> = {
    AMRAP: '#FF6B00',
    EMOM: '#7C3AED',
    'For Time': '#3B82F6',
    Strength: '#22C55E',
    Hero: '#EF4444',
    Outro: '#4A4A60',
};

const TYPE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
    AMRAP: 'repeat-outline',
    EMOM: 'timer-outline',
    'For Time': 'stopwatch-outline',
    Strength: 'barbell-outline',
    Hero: 'shield-outline',
    Outro: 'ellipsis-horizontal-outline',
};

export default function DashboardScreen() {
    const navigation = useNavigation<NavProp>();
    const { colors, isDark } = useTheme();

    const { totalWods, currentStreak, totalPRs } = useAppStore();
    const { wods, todayWod } = useWodStore();
    const { recentPRs } = useExerciseStore();
    const user = useAuthStore((s) => s.user);

    const [refreshing, setRefreshing] = React.useState(false);

    useFocusEffect(
        useCallback(() => { loadData(); }, [user?.id])
    );

    async function loadData() {
        if (!user) return;
        try {
            const { wods: rawWods, exerciseEntries: rawEntries } = await fetchHistory(user.id);
            const allWods = rawWods as WodEntry[];
            const today = toDateOnly(new Date().toISOString());

            useWodStore.getState().setWods(allWods);
            useWodStore.getState().setTodayWod(
                allWods.find((w) => toDateOnly(w.date) === today) ?? null
            );
            useAppStore.getState().setTotalWods(allWods.length);
            useAppStore.getState().setCurrentStreak(calculateStreakFromWods(allWods));

            const entries = rawEntries.map(toExerciseEntry);
            const prs = entries.filter((e) => e.isPR);
            useExerciseStore.getState().setRecentPRs(prs.slice(0, 10));
            useAppStore.getState().setTotalPRs(prs.length);
        } catch (e) {
            console.error('Erro ao carregar dashboard:', e);
        }
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }

    const recentWods = wods.slice(0, 5);

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.orange}
                    />
                }
            >
                {/* ── Hero Header com gradiente ── */}
                <LinearGradient
                    colors={
                        isDark
                            ? ['#1A0A00', '#0F0520', colors.background]
                            : ['#FFF3E8', '#F0EAFF', colors.background]
                    }
                    locations={[0, 0.5, 1]}
                    style={styles.hero}
                >
                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <View>
                            <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                                {getGreeting()}
                            </Text>
                            <Text style={[styles.date, { color: colors.textSecondary }]}>
                                {formatDate()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.settingsBtn,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                            ]}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons
                                name="settings-outline"
                                size={18}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Streak banner */}
                    <LinearGradient
                        colors={['#FF6B00', '#FF8C3A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.streakBanner}
                    >
                        <View style={styles.streakLeft}>
                            <Text style={styles.streakLabel}>SEQUÊNCIA ATIVA</Text>
                            <View style={styles.streakValueRow}>
                                <Text style={styles.streakNumber}>{currentStreak}</Text>
                                <Text style={styles.streakUnit}>dias</Text>
                            </View>
                        </View>
                        <View style={styles.streakRight}>
                            <Ionicons name="flame" size={48} color="rgba(255,255,255,0.3)" />
                        </View>
                    </LinearGradient>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <StatPill
                            icon="barbell-outline"
                            value={totalWods}
                            label="WODs"
                            color={colors.purple}
                            colors={colors}
                        />
                        <StatPill
                            icon="trophy-outline"
                            value={totalPRs}
                            label="PRs"
                            color={colors.prGold}
                            colors={colors}
                        />
                        <StatPill
                            icon="calendar-outline"
                            value={wods.filter(w => {
                                const d = new Date(w.date);
                                const now = new Date();
                                return d.getMonth() === now.getMonth() &&
                                    d.getFullYear() === now.getFullYear();
                            }).length}
                            label="Esse mês"
                            color={colors.info}
                            colors={colors}
                        />
                    </View>
                </LinearGradient>

                <View style={styles.body}>
                    {/* ── WOD de Hoje ── */}
                    <SectionHeader
                        title="WOD de Hoje"
                        color={colors.orange}
                        colors={colors}
                    />
                    {todayWod ? (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                navigation.navigate('WodDetail', { wodId: todayWod.id })
                            }
                        >
                            <LinearGradient
                                colors={[colors.orange + '22', colors.surface]}
                                style={[
                                    styles.todayCard,
                                    { borderColor: colors.orange + '60' },
                                ]}
                            >
                                <View style={styles.todayTop}>
                                    <View style={styles.todayBadges}>
                                        <Badge
                                            label={todayWod.type}
                                            color={TYPE_COLORS[todayWod.type]}
                                        />
                                        <Badge label={todayWod.focus} color={colors.purple} />
                                    </View>
                                    <View
                                        style={[
                                            styles.todayIconWrap,
                                            { backgroundColor: TYPE_COLORS[todayWod.type] + '25' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={TYPE_ICONS[todayWod.type] ?? 'fitness-outline'}
                                            size={20}
                                            color={TYPE_COLORS[todayWod.type]}
                                        />
                                    </View>
                                </View>
                                <Text style={[styles.todayTitle, { color: colors.textPrimary }]}>
                                    {todayWod.title}
                                </Text>
                                <Text
                                    style={[styles.todayDesc, { color: colors.textSecondary }]}
                                    numberOfLines={3}
                                >
                                    {todayWod.description}
                                </Text>
                                <View style={styles.todayFooter}>
                                    <Text style={[styles.todayLink, { color: colors.orange }]}>
                                        Ver detalhes
                                    </Text>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={14}
                                        color={colors.orange}
                                    />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <Card>
                            <EmptyState
                                icon="add-circle-outline"
                                title="Sem WOD hoje"
                                subtitle="Registre o treino de hoje para acompanhar sua evolução"
                                actionLabel="Registrar WOD"
                                onAction={() => navigation.navigate('NewWod')}
                            />
                        </Card>
                    )}

                    {/* ── PRs Recentes ── */}
                    <SectionHeader
                        title="PRs Recentes"
                        color={colors.prGold}
                        colors={colors}
                    />
                    {recentPRs.length > 0 ? (
                        <Card>
                            {recentPRs.slice(0, 4).map((pr, index) => (
                                <View
                                    key={pr.id}
                                    style={[
                                        styles.prRow,
                                        index < Math.min(recentPRs.length, 4) - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.border,
                                        },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={[colors.prGold + '30', colors.prGold + '10']}
                                        style={styles.prIconWrap}
                                    >
                                        <Ionicons name="trophy" size={16} color={colors.prGold} />
                                    </LinearGradient>
                                    <View style={styles.prInfo}>
                                        <Text style={[styles.prName, { color: colors.textPrimary }]}>
                                            {pr.name}
                                        </Text>
                                        <Text style={[styles.prDate, { color: colors.textMuted }]}>
                                            {formatShortDate(pr.date)}
                                        </Text>
                                    </View>
                                    <Text style={[styles.prWeight, { color: colors.prGold }]}>
                                        {pr.weight} lb
                                    </Text>
                                </View>
                            ))}
                        </Card>
                    ) : (
                        <Card>
                            <EmptyState
                                icon="trophy-outline"
                                title="Nenhum PR ainda"
                                subtitle="Registre seus levantamentos para acompanhar seus recordes"
                            />
                        </Card>
                    )}

                    {/* ── Treinos Recentes ── */}
                    <SectionHeader
                        title="Treinos Recentes"
                        color={colors.purple}
                        colors={colors}
                    />
                    {recentWods.length > 0 ? (
                        <Card noPadding>
                            {recentWods.map((wod, index) => (
                                <TouchableOpacity
                                    key={wod.id}
                                    style={[
                                        styles.wodRow,
                                        index < recentWods.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.border,
                                        },
                                    ]}
                                    onPress={() =>
                                        navigation.navigate('WodDetail', { wodId: wod.id })
                                    }
                                >
                                    <View
                                        style={[
                                            styles.wodAccent,
                                            {
                                                backgroundColor:
                                                    TYPE_COLORS[wod.type] ?? colors.textMuted,
                                            },
                                        ]}
                                    />
                                    <View style={styles.wodInfo}>
                                        <Text
                                            style={[styles.wodTitle, { color: colors.textPrimary }]}
                                        >
                                            {wod.title}
                                        </Text>
                                        <View style={styles.wodMeta}>
                                            <Badge
                                                label={wod.type}
                                                color={TYPE_COLORS[wod.type]}
                                                size="sm"
                                            />
                                            <Text
                                                style={[styles.wodDate, { color: colors.textMuted }]}
                                            >
                                                {formatShortDate(wod.date)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            ))}
                        </Card>
                    ) : (
                        <Card>
                            <EmptyState
                                icon="list-outline"
                                title="Nenhum treino registrado"
                                subtitle="Seu histórico aparece aqui"
                            />
                        </Card>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* ── FAB ── */}
            <LinearGradient
                colors={['#FF6B00', '#FF8C3A']}
                style={[styles.fab, shadow.orange]}
            >
                <TouchableOpacity
                    style={styles.fabInner}
                    onPress={() => navigation.navigate('NewWod')}
                    activeOpacity={0.85}
                >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}

// ── Helpers de dados vindos da API ──────────────────────────────

// A API retorna as linhas de exercise_entries em snake_case (ver
// app-server/models/exerciseEntryModel.js), diferente do formato
// usado no resto do app mobile.
function toExerciseEntry(row: any): ExerciseEntry {
    return {
        id: row.id,
        name: row.exercise_name,
        weight: row.weight,
        reps: row.reps ?? undefined,
        date: row.date,
        isPR: !!row.is_pr,
        notes: row.notes ?? undefined,
    };
}

// Conta quantos dias consecutivos (até hoje) têm pelo menos 1 WOD,
// a partir da lista de WODs já carregada (evita outra chamada à API).
function calculateStreakFromWods(wods: WodEntry[]): number {
    const uniqueDates = Array.from(
        new Set(wods.map((w) => toDateOnly(w.date)))
    ).sort((a, b) => (a < b ? 1 : -1));

    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
        const wodDate = new Date(uniqueDates[i] + 'T00:00:00');
        const diffDays = Math.round(
            (today.getTime() - wodDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (i === 0 && diffDays > 1) return 0;

        if (diffDays === i) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// ── Componentes locais ───────────────────────────────────────────

function StatPill({
    icon,
    value,
    label,
    color,
    colors,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    value: number;
    label: string;
    color: string;
    colors: any;
}) {
    return (
        <View
            style={[
                styles.statPill,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            <Ionicons name={icon} size={14} color={color} />
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {label}
            </Text>
        </View>
    );
}

function SectionHeader({
    title,
    color,
    colors,
}: {
    title: string;
    color: string;
    colors: any;
}) {
    return (
        <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: color }]} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                {title.toUpperCase()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    // Hero
    hero: {
        paddingTop: Platform.OS === 'ios' ? 56 : 20,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    date: {
        fontSize: 12,
        marginTop: 3,
        textTransform: 'capitalize',
    },
    settingsBtn: {
        width: 38,
        height: 38,
        borderRadius: radius.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Streak
    streakBanner: {
        borderRadius: radius.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    streakLeft: {},
    streakLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    streakValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    streakNumber: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -2,
    },
    streakUnit: {
        fontSize: 18,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    streakRight: { opacity: 0.6 },

    // Stats pills
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    statPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: radius.full,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        flex: 1,
    },

    // Body
    body: {
        paddingHorizontal: spacing.md,
    },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    sectionAccent: {
        width: 3,
        height: 14,
        borderRadius: 2,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },

    // Today WOD
    todayCard: {
        borderRadius: radius.xl,
        borderWidth: 1.5,
        padding: spacing.md,
    },
    todayTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    todayBadges: { flexDirection: 'row', gap: 6 },
    todayIconWrap: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    todayTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.4,
        marginBottom: spacing.xs,
    },
    todayDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    todayFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: spacing.md,
        alignSelf: 'flex-end',
    },
    todayLink: {
        fontWeight: '600',
        fontSize: 13,
    },

    // PRs
    prRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 10,
    },
    prIconWrap: {
        width: 34,
        height: 34,
        borderRadius: radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    prInfo: { flex: 1 },
    prName: {
        fontSize: 14,
        fontWeight: '600',
    },
    prDate: {
        fontSize: 11,
        marginTop: 1,
    },
    prWeight: {
        fontSize: 16,
        fontWeight: '800',
    },

    // WODs recentes
    wodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
        gap: 12,
    },
    wodAccent: {
        width: 3,
        height: 36,
        borderRadius: 2,
    },
    wodInfo: { flex: 1 },
    wodTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    wodMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    wodDate: {
        fontSize: 11,
        fontWeight: '500',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 90,
        right: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    fabInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});