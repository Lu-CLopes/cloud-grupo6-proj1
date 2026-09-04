import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../theme';
import { fetchHistory } from '../services/api/historyApi';
import { useWodStore, WodEntry } from '../store/useWodStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatShortDate } from '../utils/formatters';
import { RootStackParamList } from '../navigation/types';

import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import SegmentedControl from '../components/SegmentedControl';
import ScreenHeader from '../components/ScreenHeader';

type NavProp = StackNavigationProp<RootStackParamList>;

const TYPE_COLORS: Record<string, string> = {
    AMRAP: colors.orange,
    EMOM: colors.purple,
    'For Time': colors.info,
    Strength: colors.success,
    Hero: colors.error,
    Outro: colors.textMuted,
};

const FOCUS_FILTERS = [
    { label: 'Todos', value: 'all' },
    { label: 'Cardio', value: 'Cardio' },
    { label: 'Força', value: 'Força' },
    { label: 'Ginástico', value: 'Ginástico' },
    { label: 'Misto', value: 'Misto' },
];

export default function HistoryScreen() {
    const navigation = useNavigation<NavProp>();
    const { wods, setWods } = useWodStore();
    const { setTotalWods } = useAppStore();
    const user = useAuthStore((s) => s.user);

    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => { loadData(); }, [user?.id])
    );

    async function loadData() {
        if (!user) return;
        // Funcionalidade #5 — GET /api/users/:id/history (traz WODs + exercícios)
        const { wods: data } = await fetchHistory(user.id);
        setWods(data as WodEntry[]);
        setTotalWods(data.length);
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }

    async function handleDelete(wod: WodEntry) {
        Alert.alert(
            'Deletar WOD',
            `Tem certeza que quer deletar "${wod.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: () => {
                        // A exclusão de WOD não faz parte do escopo das 5
                        // funcionalidades da API deste projeto (ver README).
                        Alert.alert(
                            'Indisponível',
                            'A exclusão de WODs ainda não está implementada na API deste projeto.'
                        );
                    },
                },
            ]
        );
    }

    const filtered =
        filter === 'all' ? wods : wods.filter((w) => w.focus === filter);

    const grouped = groupByMonth(filtered);

    return (
        <View style={styles.root}>
            <ScreenHeader
                title="Histórico"
                subtitle={`${wods.length} treino${wods.length !== 1 ? 's' : ''}`}
                hideBack
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
                <SegmentedControl
                    options={FOCUS_FILTERS}
                    value={filter}
                    onChange={setFilter}
                    scrollable
                />

                {filtered.length === 0 ? (
                    <Card style={{ marginTop: spacing.md }}>
                        <EmptyState
                            title="Nenhum treino aqui"
                            subtitle="Registre WODs usando o botão + no Dashboard"
                        />
                    </Card>
                ) : (
                    Object.entries(grouped).map(([month, monthWods]) => (
                        <View key={month}>
                            <Text style={styles.monthLabel}>{month}</Text>
                            <Card>
                                {monthWods.map((wod, index) => (
                                    <TouchableOpacity
                                        key={wod.id}
                                        style={[
                                            styles.wodRow,
                                            index < monthWods.length - 1 && styles.wodBorder,
                                        ]}
                                        onPress={() =>
                                            navigation.navigate('WodDetail', { wodId: wod.id })
                                        }
                                        onLongPress={() => handleDelete(wod)}
                                    >
                                        <View
                                            style={[
                                                styles.typeBar,
                                                { backgroundColor: TYPE_COLORS[wod.type] ?? colors.textMuted },
                                            ]}
                                        />
                                        <View style={styles.wodContent}>
                                            <View style={styles.wodTop}>
                                                <Text style={styles.wodTitle} numberOfLines={1}>
                                                    {wod.title}
                                                </Text>
                                                <Text style={styles.wodDate}>
                                                    {formatShortDate(wod.date)}
                                                </Text>
                                            </View>
                                            <View style={styles.wodBottom}>
                                                <Badge label={wod.type} color={TYPE_COLORS[wod.type]} />
                                                <Badge label={wod.focus} color={colors.purple} />
                                                {wod.intensity && (
                                                    <Badge
                                                        label={`${wod.intensity}/10`}
                                                        color={
                                                            wod.intensity >= 8 ? colors.error :
                                                                wod.intensity >= 5 ? colors.warning :
                                                                    colors.success
                                                        }
                                                    />
                                                )}
                                            </View>
                                            {wod.result && (
                                                <Text style={styles.wodResult}>{wod.result}</Text>
                                            )}
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={18}
                                            color={colors.textMuted}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </Card>
                        </View>
                    ))
                )}

                <Text style={styles.hint}>Segure um treino para deletar</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function groupByMonth(wods: WodEntry[]): Record<string, WodEntry[]> {
    return wods.reduce((groups, wod) => {
        const date = new Date(wod.date + 'T00:00:00');
        const month = date.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
        });
        const key = month.charAt(0).toUpperCase() + month.slice(1);
        if (!groups[key]) groups[key] = [];
        groups[key].push(wod);
        return groups;
    }, {} as Record<string, WodEntry[]>);
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    monthLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'capitalize',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    wodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: 12,
    },
    wodBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    typeBar: {
        width: 3,
        height: 40,
        borderRadius: 2,
    },
    wodContent: { flex: 1 },
    wodTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    wodTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
        marginRight: spacing.sm,
    },
    wodDate: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
    wodBottom: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    wodResult: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 6,
        fontWeight: '500',
    },
    hint: {
        textAlign: 'center',
        fontSize: 11,
        color: colors.textMuted,
        marginTop: spacing.lg,
        fontStyle: 'italic',
    },
});