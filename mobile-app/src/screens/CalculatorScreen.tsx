import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../theme';
import {
    calculatePlates,
    calculateProgression,
    BarType,
    BAR_WEIGHT,
    CalculationResult,
    ProgressionStep,
} from '../utils/plateCalculator';

import Card from '../components/Card';
import SegmentedControl from '../components/SegmentedControl';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ScreenHeader from '../components/ScreenHeader';

const BAR_OPTIONS = [
    { label: 'Masculina (45lb)', value: 'male' },
    { label: 'Feminina (35lb)', value: 'female' },
];

const MODE_OPTIONS = [
    { label: 'Peso fixo', value: 'fixed' },
    { label: 'Progressão', value: 'progression' },
];

const INCREMENT_OPTIONS = [
    { label: '+5%', value: '0.05' },
    { label: '+10%', value: '0.10' },
    { label: '+15%', value: '0.15' },
    { label: '+20%', value: '0.20' },
];

const PLATE_COLORS: Record<number, string> = {
    45: '#1A1A1A',
    35: '#2563EB',
    25: '#15803D',
    15: '#F59E0B',
    10: '#FFFFFF',
    5: '#1A1A1A',
    2.5: '#DC2626',
};

export default function CalculatorScreen() {
    const [barType, setBarType] = useState<BarType>('male');
    const [mode, setMode] = useState<'fixed' | 'progression'>('fixed');
    const [weightInput, setWeightInput] = useState('');
    const [increment, setIncrement] = useState('0.10');
    const [steps, setSteps] = useState('5');
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [progression, setProgression] = useState<ProgressionStep[]>([]);

    function handleCalculate() {
        const weight = parseFloat(weightInput);
        if (isNaN(weight) || weight <= 0) return;
        if (mode === 'fixed') {
            setResult(calculatePlates(weight, barType));
            setProgression([]);
        } else {
            setProgression(
                calculateProgression(weight, barType, parseInt(steps) || 5, parseFloat(increment))
            );
            setResult(null);
        }
    }

    const barWeight = BAR_WEIGHT[barType];
    const weightNum = parseFloat(weightInput) || 0;

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Calculadora" hideBack />

            <ScrollView
                style={styles.root}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Card style={styles.section}>
                    <SegmentedControl
                        label="Barra"
                        options={BAR_OPTIONS}
                        value={barType}
                        onChange={(v) => {
                            setBarType(v as BarType);
                            setResult(null);
                            setProgression([]);
                        }}
                    />
                    <SegmentedControl
                        label="Modo"
                        options={MODE_OPTIONS}
                        value={mode}
                        onChange={(v) => {
                            setMode(v as 'fixed' | 'progression');
                            setResult(null);
                            setProgression([]);
                        }}
                    />
                </Card>

                <Card style={styles.section}>
                    <TextInput
                        label={mode === 'fixed' ? 'Peso total (lb)' : 'Peso inicial (lb)'}
                        value={weightInput}
                        onChangeText={setWeightInput}
                        placeholder={`Mínimo ${barWeight}lb (só a barra)`}
                        keyboardType="decimal-pad"
                        hint={
                            weightNum > 0 && weightNum < barWeight
                                ? `Peso mínimo é ${barWeight}lb`
                                : weightNum > 0
                                    ? `${((weightNum - barWeight) / 2).toFixed(1)}lb por lado`
                                    : undefined
                        }
                    />
                    {mode === 'progression' && (
                        <>
                            <SegmentedControl
                                label="Incremento por etapa"
                                options={INCREMENT_OPTIONS}
                                value={increment}
                                onChange={setIncrement}
                            />
                            <TextInput
                                label="Número de etapas"
                                value={steps}
                                onChangeText={setSteps}
                                keyboardType="number-pad"
                                placeholder="5"
                            />
                        </>
                    )}
                    <Button
                        label="Calcular"
                        onPress={handleCalculate}
                        disabled={!weightInput || parseFloat(weightInput) < barWeight}
                    />
                </Card>

                {result && <FixedResult result={result} barType={barType} />}
                {progression.length > 0 && (
                    <ProgressionResult steps={progression} barType={barType} />
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function FixedResult({
    result,
    barType,
}: {
    result: CalculationResult;
    barType: BarType;
}) {
    return (
        <Card variant="highlighted" style={{ marginBottom: spacing.md }}>
            <View style={styles.resultHeader}>
                <View>
                    <Text style={styles.resultLabel}>PESO TOTAL</Text>
                    <Text style={styles.resultWeight}>{result.totalWeight} lb</Text>
                    <Text style={styles.resultSub}>
                        {result.barWeight}lb barra + {result.weightPerSide}lb × 2
                    </Text>
                </View>
                <Badge
                    label={result.isExact ? 'Exato' : 'Aprox'}
                    color={result.isExact ? colors.success : colors.warning}
                />
            </View>

            <View style={styles.barVisual}>
                {[...result.plates].reverse().map((p, i) =>
                    Array(p.count).fill(0).map((_, j) => (
                        <PlateView key={`L-${i}-${j}`} weight={p.plate} />
                    ))
                )}
                <View style={styles.barCenter}>
                    <Text style={styles.barText}>{barType === 'male' ? '45' : '35'}</Text>
                </View>
                {result.plates.map((p, i) =>
                    Array(p.count).fill(0).map((_, j) => (
                        <PlateView key={`R-${i}-${j}`} weight={p.plate} />
                    ))
                )}
            </View>

            <Text style={styles.plateListTitle}>POR LADO</Text>
            <View style={styles.plateList}>
                {result.plates.length === 0 ? (
                    <Text style={styles.noPlates}>Só a barra</Text>
                ) : (
                    result.plates.map((p) => (
                        <View key={p.plate} style={styles.plateItem}>
                            <View
                                style={[
                                    styles.plateDot,
                                    { backgroundColor: PLATE_COLORS[p.plate] ?? colors.surface },
                                ]}
                            />
                            <Text style={styles.plateItemText}>{p.count}× {p.plate}lb</Text>
                            <Text style={styles.plateItemSub}>= {p.plate * p.count}lb</Text>
                        </View>
                    ))
                )}
            </View>

            {!result.isExact && (
                <Text style={styles.warning}>
                    Não foi possível montar exatamente. Faltam {result.remainder}lb.
                    Use {result.totalWeight}lb ou {result.totalWeight + 2.5}lb.
                </Text>
            )}
        </Card>
    );
}

function ProgressionResult({
    steps,
    barType,
}: {
    steps: ProgressionStep[];
    barType: BarType;
}) {
    const [expanded, setExpanded] = useState<number | null>(0);

    return (
        <View style={{ marginBottom: spacing.md }}>
            <Text style={styles.progressionTitle}>PROGRESSÃO DE CARGA</Text>
            {steps.map((step) => (
                <TouchableOpacity
                    key={step.step}
                    style={styles.progressionCard}
                    onPress={() => setExpanded(expanded === step.step ? null : step.step)}
                    activeOpacity={0.8}
                >
                    <View style={styles.stepHeader}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{step.step}</Text>
                        </View>
                        <View style={styles.stepInfo}>
                            <Text style={styles.stepWeight}>{step.result.totalWeight} lb</Text>
                            <Text style={styles.stepSub}>{step.result.weightPerSide}lb por lado</Text>
                        </View>
                        <View style={styles.stepBadges}>
                            {step.platesToAdd.length > 0 && (
                                <Badge
                                    label={`+${step.platesToAdd.map((p) => `${p.count}×${p.plate}`).join(' ')}`}
                                    color={colors.success}
                                />
                            )}
                            {step.platesToRemove.length > 0 && (
                                <Badge
                                    label={`-${step.platesToRemove.map((p) => `${p.count}×${p.plate}`).join(' ')}`}
                                    color={colors.error}
                                    style={{ marginTop: 4 }}
                                />
                            )}
                            {step.step === 1 && (
                                <Badge label="Início" color={colors.purple} />
                            )}
                        </View>
                        <Ionicons
                            name={expanded === step.step ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={colors.textMuted}
                        />
                    </View>

                    {expanded === step.step && (
                        <View style={styles.stepDetail}>
                            <View style={styles.plateList}>
                                {step.result.plates.map((p) => (
                                    <View key={p.plate} style={styles.plateItem}>
                                        <View
                                            style={[
                                                styles.plateDot,
                                                { backgroundColor: PLATE_COLORS[p.plate] ?? colors.surface },
                                            ]}
                                        />
                                        <Text style={styles.plateItemText}>{p.count}× {p.plate}lb</Text>
                                    </View>
                                ))}
                                {step.result.plates.length === 0 && (
                                    <Text style={styles.noPlates}>Só a barra</Text>
                                )}
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

function PlateView({ weight }: { weight: number }) {
    const color = PLATE_COLORS[weight] ?? colors.surface;
    const height = weight >= 35 ? 52 : weight >= 15 ? 44 : weight >= 5 ? 36 : 28;
    return (
        <View
            style={[
                styles.plate,
                {
                    backgroundColor: color,
                    height,
                    borderColor: color === '#FFFFFF' ? '#999' : color,
                },
            ]}
        >
            <Text
                style={[
                    styles.plateWeight,
                    { color: color === '#1A1A1A' ? '#FFF' : '#000' },
                ]}
            >
                {weight}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    section: { marginBottom: spacing.md },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    resultLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    resultWeight: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.orange,
        letterSpacing: -1,
    },
    resultSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    barVisual: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.md,
        flexWrap: 'wrap',
        gap: 2,
    },
    barCenter: {
        width: 48,
        height: 16,
        backgroundColor: colors.textMuted,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    barText: { fontSize: 9, fontWeight: '700', color: '#000' },
    plate: {
        width: 18,
        borderRadius: 3,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plateWeight: { fontSize: 7, fontWeight: '800' },
    plateListTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    plateList: { gap: 8 },
    plateItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    plateDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    plateItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
    },
    plateItemSub: { fontSize: 13, color: colors.textMuted },
    noPlates: { fontSize: 14, color: colors.textSecondary, fontStyle: 'italic' },
    warning: {
        fontSize: 12,
        color: colors.warning,
        marginTop: spacing.md,
        lineHeight: 18,
    },
    progressionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    progressionCard: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.orange + '22',
        borderWidth: 1,
        borderColor: colors.orange,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: { fontSize: 14, fontWeight: '800', color: colors.orange },
    stepInfo: { flex: 1 },
    stepWeight: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
    stepSub: { fontSize: 12, color: colors.textMuted },
    stepBadges: { alignItems: 'flex-end' },
    stepDetail: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});