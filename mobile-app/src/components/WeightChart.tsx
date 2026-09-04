import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing } from '../theme';
import { ExerciseEntry } from '../store/useExerciseStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.md * 2 - spacing.md * 2;
const CHART_HEIGHT = 140;
const PAD_H = 40;
const PAD_V = 20;

interface WeightChartProps {
    entries: ExerciseEntry[];
}

export default function WeightChart({ entries }: WeightChartProps) {
    // Pega até os últimos 10 registros em ordem cronológica
    const data = [...entries]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-10);

    if (data.length < 2) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>
                    Registre pelo menos 2 treinos para ver o gráfico
                </Text>
            </View>
        );
    }

    const weights = data.map((e) => e.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1;

    const plotW = CHART_WIDTH - PAD_H;
    const plotH = CHART_HEIGHT - PAD_V * 2;

    // Converte peso em coordenada Y (invertido: maior peso = mais alto)
    function toY(weight: number): number {
        return PAD_V + plotH - ((weight - minW) / range) * plotH;
    }

    // Converte índice em coordenada X
    function toX(index: number): number {
        return PAD_H + (index / (data.length - 1)) * plotW;
    }

    // Monta o path SVG da linha
    const points = data.map((e, i) => ({ x: toX(i), y: toY(e.weight) }));
    const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    // Área preenchida abaixo da linha
    const areaPath =
        linePath +
        ` L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

    return (
        <View style={styles.container}>
            <Text style={styles.chartTitle}>EVOLUÇÃO DE PESO</Text>

            {/* SVG manual com View/Text — sem lib externa */}
            <View style={styles.chart}>
                {/* Linhas de grade */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                    const y = PAD_V + plotH * (1 - pct);
                    const w = Math.round(minW + range * pct);
                    return (
                        <View key={pct} style={[styles.gridLine, { top: y }]}>
                            <Text style={styles.gridLabel}>{w}</Text>
                        </View>
                    );
                })}

                {/* Linha do gráfico (usando View posicionado) */}
                {points.map((p, i) => {
                    if (i === 0) return null;
                    const prev = points[i - 1];
                    const dx = p.x - prev.x;
                    const dy = p.y - prev.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

                    return (
                        <View
                            key={i}
                            style={{
                                position: 'absolute',
                                left: prev.x,
                                top: prev.y,
                                width: length,
                                height: 2,
                                backgroundColor: colors.orange,
                                transform: [{ rotate: `${angle}deg` }],
                                transformOrigin: 'left center',
                            }}
                        />
                    );
                })}

                {/* Pontos */}
                {points.map((p, i) => {
                    const isPR = data[i].isPR;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: isPR ? colors.prGold : colors.orange,
                                    borderColor: isPR ? colors.prGold : colors.orangeLight,
                                    width: isPR ? 14 : 10,
                                    height: isPR ? 14 : 10,
                                    borderRadius: isPR ? 7 : 5,
                                    left: p.x - (isPR ? 7 : 5),
                                    top: p.y - (isPR ? 7 : 5),
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {/* Legenda */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
                    <Text style={styles.legendText}>Registro</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.prGold }]} />
                    <Text style={styles.legendText}>PR 🏆</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    chartTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    chart: {
        height: CHART_HEIGHT,
        width: '100%',
        position: 'relative',
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 9,
        color: colors.textMuted,
        marginLeft: 4,
        width: 32,
    },
    dot: {
        position: 'absolute',
        borderWidth: 2,
    },
    empty: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
    },
    legend: {
        flexDirection: 'row',
        gap: 16,
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        color: colors.textMuted,
    },
});