import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput as RNTextInput,
    RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../theme';
import { fetchAllExercises, fetchRecentPRs } from '../services/database/exercise';
import { useExerciseStore } from '../store/useExerciseStore';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../navigation/types';

import Card from '../components/Card';
import PRBadge from '../components/PRBadge';
import EmptyState from '../components/EmptyState';
import AddWeightModal from '../features/exercise/AddWeightModal';
import ScreenHeader from '../components/ScreenHeader';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function ExerciseScreen() {
    const navigation = useNavigation<NavProp>();
    const { exercises, recentPRs, setExercises, setRecentPRs } = useExerciseStore();
    const { setTotalPRs } = useAppStore();

    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => { loadData(); }, [])
    );

    async function loadData() {
        const [exs, prs] = await Promise.all([
            fetchAllExercises(),
            fetchRecentPRs(),
        ]);
        setExercises(exs);
        setRecentPRs(prs);
        setTotalPRs(exs.length);
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }

    const filtered = exercises.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.root}>
            <ScreenHeader
                title="Exercícios"
                hideBack
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
                {/* ── Search ── */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={16} color={colors.textMuted} />
                    <RNTextInput
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar exercício..."
                        placeholderTextColor={colors.textMuted}
                        selectionColor={colors.orange}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── PRs Recentes ── */}
                {recentPRs.length > 0 && search.length === 0 && (
                    <>
                        <SectionLabel title="PRs Recentes" />
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.prScroll}
                        >
                            {recentPRs.slice(0, 6).map((pr) => (
                                <TouchableOpacity
                                    key={pr.id}
                                    style={styles.prCard}
                                    onPress={() =>
                                        navigation.navigate('ExerciseDetail', { exerciseName: pr.name })
                                    }
                                >
                                    <Text style={styles.prCardName} numberOfLines={1}>
                                        {pr.name}
                                    </Text>
                                    <PRBadge weight={pr.weight} />
                                    <Text style={styles.prCardDate}>
                                        {new Date(pr.date).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'short',
                                        })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                {/* ── Lista ── */}
                <SectionLabel
                    title={
                        search.length > 0
                            ? `Resultados (${filtered.length})`
                            : `Todos (${exercises.length})`
                    }
                />

                {filtered.length === 0 ? (
                    <Card>
                        <EmptyState
                            title={
                                search.length > 0
                                    ? 'Nenhum exercício encontrado'
                                    : 'Nenhum exercício registrado'
                            }
                            subtitle={
                                search.length > 0
                                    ? 'Tente buscar por outro nome'
                                    : 'Registre sua primeira carga usando o botão +'
                            }
                            actionLabel={search.length === 0 ? 'Registrar carga' : undefined}
                            onAction={search.length === 0 ? () => setModalVisible(true) : undefined}
                        />
                    </Card>
                ) : (
                    <Card>
                        {filtered.map((ex, index) => (
                            <TouchableOpacity
                                key={ex.name}
                                style={[
                                    styles.exerciseRow,
                                    index < filtered.length - 1 && styles.exerciseBorder,
                                ]}
                                onPress={() =>
                                    navigation.navigate('ExerciseDetail', { exerciseName: ex.name })
                                }
                            >
                                <View style={styles.exerciseLeft}>
                                    <Text style={styles.exerciseName}>{ex.name}</Text>
                                    <Text style={styles.exerciseCount}>
                                        {ex.history.length} registro{ex.history.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                                <View style={styles.exerciseRight}>
                                    <PRBadge weight={ex.currentPR} />
                                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </Card>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>

            <AddWeightModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSaved={loadData}
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
        paddingTop: spacing.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xs,
        gap: 8,
        height: 46,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.textPrimary,
        height: '100%',
    },
    prScroll: {
        gap: 10,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    prCard: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        width: 140,
        gap: 6,
    },
    prCardName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    prCardDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: 12,
    },
    exerciseBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    exerciseLeft: { flex: 1 },
    exerciseName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    exerciseCount: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    exerciseRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});