import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { colors, spacing } from '../theme';
import { fetchExerciseHistory } from '../services/database/exercise';
import { ExerciseEntry } from '../store/useExerciseStore';
import { RootStackParamList } from '../navigation/types';
import { formatShortDate } from '../utils/formatters';

import Card from '../components/Card';
import PRBadge from '../components/PRBadge';
import WeightChart from '../components/WeightChart';
import AddWeightModal from '../features/exercise/AddWeightModal';
import ScreenHeader from '../components/ScreenHeader';

type RoutePropType = RouteProp<RootStackParamList, 'ExerciseDetail'>;

const PERCENTAGES = [
    { label: '75%', pct: 0.75, color: colors.error, desc: 'Intenso' },
    { label: '50%', pct: 0.50, color: colors.info, desc: 'Moderado' },
    { label: '15%', pct: 0.15, color: colors.success, desc: 'Leve' },
];

export default function ExerciseDetailScreen() {
    const route = useRoute<RoutePropType>();
    const { exerciseName } = route.params;

    const [history, setHistory] = useState<ExerciseEntry[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const currentPR =
        history.find((e) => e.isPR)?.weight ??
        Math.max(...history.map((e) => e.weight).concat(0));

    useEffect(() => { loadHistory(); }, []);

    async function loadHistory() {
        const data = await fetchExerciseHistory(exerciseName);
        setHistory(data);
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    }

    return (
        <View style={styles.root}>
            <ScreenHeader
                title={exerciseName}
                rightIcon="add-circle-outline"
                onRightPress={() => setModalVisible(true)}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.orange}
                    />
                }
            >
                {/* ── PR atual ── */}
                {currentPR > 0 && (
                    <Card variant="highlighted" style={styles.prCard}>
                        <Text style={styles.prLabel}>PR ATUAL</Text>
                        <Text style={styles.prValue}>{currentPR} lb</Text>
                        <Text style={styles.prSub}>
                            {(currentPR * 0.453592).toFixed(1)} kg
                        </Text>
                    </Card>
                )}

                {/* ── Percentuais ── */}
                {currentPR > 0 && (
                    <>
                        <SectionLabel title="Percentuais — Heavy Day" />
                        <View style={styles.pctRow}>
                            {PERCENTAGES.map((p) => {
                                const w = Math.round((currentPR * p.pct) / 2.5) * 2.5;
                                return (
                                    <View
                                        key={p.label}
                                        style={[styles.pctCard, { borderColor: p.color + '66' }]}
                                    >
                                        <Text style={[styles.pctLabel, { color: p.color }]}>
                                            {p.label}
                                        </Text>
                                        <Text style={styles.pctWeight}>{w} lb</Text>
                                        <Text style={styles.pctDesc}>{p.desc}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* ── Gráfico ── */}
                {history.length >= 2 && (
                    <>
                        <SectionLabel title="Evolução" />
                        <Card>
                            <WeightChart entries={history} />
                        </Card>
                    </>
                )}

                {/* ── Histórico ── */}
                <SectionLabel title={`Histórico (${history.length})`} />
                {history.length === 0 ? (
                    <Card>
                        <Text style={styles.emptyText}>
                            Nenhum registro ainda. Use o botão + para adicionar.
                        </Text>
                    </Card>
                ) : (
                    <Card>
                        {history.map((entry, index) => (
                            <View
                                key={entry.id}
                                style={[
                                    styles.historyRow,
                                    index < history.length - 1 && styles.historyBorder,
                                ]}
                            >
                                <View style={styles.historyLeft}>
                                    <Text style={styles.historyDate}>
                                        {formatShortDate(entry.date)}
                                    </Text>
                                    {entry.notes && (
                                        <Text style={styles.historyNotes} numberOfLines={1}>
                                            {entry.notes}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.historyRight}>
                                    {entry.reps && entry.reps > 1 && (
                                        <Text style={styles.historyReps}>{entry.reps} reps</Text>
                                    )}
                                    {entry.isPR ? (
                                        <PRBadge weight={entry.weight} />
                                    ) : (
                                        <Text style={styles.historyWeight}>{entry.weight} lb</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </Card>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <AddWeightModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                exerciseName={exerciseName}
                onSaved={loadHistory}
            />
        </View>
    );
}

function SectionLabel({ title }: { title: string }) {
    return <Text style={secStyles.label}>{title}</Text>;
}
const secStyles = StyleSheet.create({
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        marginHorizontal: spacing.xs,
    },
});

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    prCard: { alignItems: 'center', paddingVertical: spacing.lg },
    prLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: spacing.xs,
    },
    prValue: {
        fontSize: 52,
        fontWeight: '900',
        color: colors.prGold,
        letterSpacing: -2,
    },
    prSub: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },
    pctRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.xs },
    pctCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        padding: spacing.sm,
        alignItems: 'center',
    },
    pctLabel: { fontSize: 13, fontWeight: '800' },
    pctWeight: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: 4,
    },
    pctDesc: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm + 2,
    },
    historyBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    historyLeft: { flex: 1 },
    historyDate: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    historyNotes: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    historyRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    historyReps: { fontSize: 12, color: colors.textMuted },
    historyWeight: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
});