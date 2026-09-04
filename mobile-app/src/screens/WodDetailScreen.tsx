import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { colors, spacing } from '../theme';
import { fetchWodById, deleteWod } from '../services/database/wod';
import { analyzeWod } from '../services/api/openai';
import { WodEntry } from '../store/useWodStore';
import { RootStackParamList } from '../navigation/types';
import { formatDate } from '../utils/formatters';

import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropT = RouteProp<RootStackParamList, 'WodDetail'>;

const TYPE_COLORS: Record<string, string> = {
    AMRAP: colors.orange,
    EMOM: colors.purple,
    'For Time': colors.info,
    Strength: colors.success,
    Hero: colors.error,
    Outro: colors.textMuted,
};

export default function WodDetailScreen() {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<RoutePropT>();
    const { wodId } = route.params;

    const [wod, setWod] = useState<WodEntry | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [aiLoading, setAiLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadWod(); }, [wodId]);

    async function loadWod() {
        setLoading(true);
        const data = await fetchWodById(wodId);
        setWod(data);
        setLoading(false);
    }

    async function handleDelete() {
        Alert.alert(
            'Deletar WOD',
            `Tem certeza que quer deletar "${wod?.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteWod(wodId);
                        navigation.goBack();
                    },
                },
            ]
        );
    }

    async function handleAiAnalysis() {
        if (!wod) return;
        setAiLoading(true);
        setAiAnalysis('');
        try {
            const analysis = await analyzeWod(wod);
            setAiAnalysis(analysis);
        } catch (e: any) {
            Alert.alert(
                e.message.includes('API key')
                    ? 'IA não configurada'
                    : 'Erro na análise',
                e.message
            );
        } finally {
            setAiLoading(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.orange} size="large" />
            </View>
        );
    }

    if (!wod) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>WOD não encontrado.</Text>
            </View>
        );
    }

    const typeColor = TYPE_COLORS[wod.type] ?? colors.textMuted;

    return (
        <View style={styles.root}>
            <ScreenHeader
                title={wod.title}
                subtitle={formatDate(new Date(wod.date + 'T00:00:00'))}
                rightIcon="trash-outline"
                onRightPress={handleDelete}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Badges ── */}
                <View style={styles.badgeRow}>
                    <Badge label={wod.type} color={typeColor} />
                    <Badge label={wod.focus} color={colors.purple} />
                </View>

                {/* ── Descrição ── */}
                <SectionLabel title="Descrição" />
                <Card>
                    <Text style={styles.description}>{wod.description}</Text>
                </Card>

                {/* ── Resultado ── */}
                {wod.result && (
                    <>
                        <SectionLabel title="Resultado" />
                        <Card variant="highlighted">
                            <Text style={styles.result}>{wod.result}</Text>
                        </Card>
                    </>
                )}

                {/* ── Como foi ── */}
                {(wod.intensity || wod.fatigue || wod.hardestExercise) && (
                    <>
                        <SectionLabel title="Como foi" />
                        <Card>
                            {wod.intensity && (
                                <FeelingRow
                                    label="Intensidade"
                                    value={wod.intensity}
                                />
                            )}
                            {wod.fatigue && (
                                <FeelingRow
                                    label="Fadiga"
                                    value={wod.fatigue}
                                    last={!wod.hardestExercise}
                                />
                            )}
                            {wod.hardestExercise && (
                                <View style={[styles.feelRow, styles.feelLast]}>
                                    <View style={styles.feelInfo}>
                                        <Text style={styles.feelLabel}>Exercício mais difícil</Text>
                                        <Text style={styles.feelText}>{wod.hardestExercise}</Text>
                                    </View>
                                </View>
                            )}
                        </Card>
                    </>
                )}

                {/* ── Notas ── */}
                {wod.notes && (
                    <>
                        <SectionLabel title="Observações" />
                        <Card>
                            <Text style={styles.notes}>{wod.notes}</Text>
                        </Card>
                    </>
                )}

                {/* ── Análise IA ── */}
                <SectionLabel title="Análise da IA" />
                <Card>
                    {aiAnalysis ? (
                        <View>
                            <Text style={styles.aiText}>{aiAnalysis}</Text>
                            <TouchableOpacity
                                onPress={handleAiAnalysis}
                                style={styles.reanalyzeBtn}
                            >
                                <Text style={styles.reanalyzeText}>Reanalisar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.aiEmpty}>
                            <Text style={styles.aiEmptyTitle}>Análise inteligente</Text>
                            <Text style={styles.aiEmptySubtitle}>
                                A IA analisa sua performance e sugere melhorias personalizadas.
                            </Text>
                            <Button
                                label={aiLoading ? 'Analisando...' : 'Analisar com IA'}
                                onPress={handleAiAnalysis}
                                loading={aiLoading}
                                style={styles.aiBtn}
                            />
                        </View>
                    )}
                </Card>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function FeelingRow({
    label,
    value,
    last = false,
}: {
    label: string;
    value: number;
    last?: boolean;
}) {
    function barColor(v: number) {
        if (v <= 3) return colors.success;
        if (v <= 6) return colors.warning;
        return colors.error;
    }
    return (
        <View style={[styles.feelRow, last && styles.feelLast]}>
            <View style={styles.feelInfo}>
                <View style={styles.feelHeader}>
                    <Text style={styles.feelLabel}>{label}</Text>
                    <Text style={[styles.feelValue, { color: barColor(value) }]}>
                        {value}/10
                    </Text>
                </View>
                <View style={styles.bar}>
                    <View
                        style={[
                            styles.barFill,
                            { width: `${value * 10}%`, backgroundColor: barColor(value) },
                        ]}
                    />
                </View>
            </View>
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
    center: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: { color: colors.textSecondary, fontSize: 16 },
    content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: 15,
        color: colors.textPrimary,
        lineHeight: 24,
        fontFamily: 'Courier',
    },
    result: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.orange,
        letterSpacing: -1,
        textAlign: 'center',
        paddingVertical: spacing.sm,
    },
    feelRow: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    feelLast: { borderBottomWidth: 0, paddingBottom: 0 },
    feelInfo: { flex: 1 },
    feelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    feelLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    feelValue: { fontSize: 14, fontWeight: '800' },
    feelText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    bar: {
        height: 6,
        backgroundColor: colors.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: { height: '100%', borderRadius: 3 },
    notes: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    aiEmpty: { alignItems: 'center', paddingVertical: spacing.md },
    aiEmptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    aiEmptySubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    aiBtn: { alignSelf: 'stretch' },
    aiText: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 22,
    },
    reanalyzeBtn: { marginTop: spacing.md, alignSelf: 'flex-end' },
    reanalyzeText: {
        color: colors.orange,
        fontSize: 13,
        fontWeight: '600',
    },
});