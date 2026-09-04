import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import { colors, spacing } from '../../theme';
import { createExerciseEntry } from '../../services/api/exerciseApi';
import { useExerciseStore } from '../../store/useExerciseStore';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import SegmentedControl from '../../components/SegmentedControl';

interface AddWeightModalProps {
    visible: boolean;
    onClose: () => void;
    exerciseName?: string;
    onSaved: () => void;
}

const COMMON_EXERCISES = [
    'Back Squat', 'Front Squat', 'Overhead Squat',
    'Deadlift', 'Romanian Deadlift', 'Sumo Deadlift',
    'Clean', 'Power Clean', 'Hang Power Clean',
    'Snatch', 'Power Snatch', 'Hang Power Snatch',
    'Clean & Jerk', 'Push Press', 'Push Jerk',
    'Strict Press', 'Bench Press', 'Thruster',
];

export default function AddWeightModal({
    visible,
    onClose,
    exerciseName,
    onSaved,
}: AddWeightModalProps) {
    const [name, setName] = useState(exerciseName ?? '');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('1');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { addEntry } = useExerciseStore();

    useEffect(() => {
        if (exerciseName) setName(exerciseName);
    }, [exerciseName]);

    const suggestions = COMMON_EXERCISES.filter((e) =>
        e.toLowerCase().includes(name.toLowerCase()) && name.length > 0
    );

    async function handleSave() {
        if (!name.trim() || !weight) {
            Alert.alert('Atenção', 'Preencha o exercício e o peso.');
            return;
        }

        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0) {
            Alert.alert('Atenção', 'Peso inválido.');
            return;
        }

        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await createExerciseEntry({
                exerciseName: name.trim(),
                weight: weightNum,
                reps: parseInt(reps) || 1,
                date: today,
                notes: notes.trim() || undefined,
            });

            // A store local espera o campo `name` (não `exerciseName`)
            const saved = {
                id: result.id,
                name: result.exerciseName,
                weight: result.weight,
                reps: result.reps,
                date: result.date,
                isPR: result.isPR,
                notes: result.notes,
            };

            addEntry(saved);
            onSaved();

            // Limpa o form
            setWeight('');
            setReps('1');
            setNotes('');
            if (!exerciseName) setName('');

            Alert.alert(
                saved.isPR ? '🏆 NOVO PR!' : '✅ Carga registrada',
                saved.isPR
                    ? `${name}: ${weightNum}lb — Novo recorde pessoal!`
                    : `${name}: ${weightNum}lb registrado.`
            );
            onClose();
        } catch (e: any) {
            Alert.alert('Erro', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Handle */}
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Carga</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Nome do exercício */}
                    <TextInput
                        label="Exercício *"
                        value={name}
                        onChangeText={(t) => {
                            setName(t);
                            setShowSuggestions(true);
                        }}
                        placeholder="Ex: Back Squat, Deadlift..."
                        autoCapitalize="words"
                    />

                    {/* Sugestões */}
                    {showSuggestions && suggestions.length > 0 && (
                        <View style={styles.suggestions}>
                            {suggestions.slice(0, 5).map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={styles.suggestion}
                                    onPress={() => {
                                        setName(s);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <Text style={styles.suggestionText}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Peso e reps */}
                    <View style={styles.row}>
                        <View style={{ flex: 1.5 }}>
                            <TextInput
                                label="Peso (lb) *"
                                value={weight}
                                onChangeText={setWeight}
                                placeholder="Ex: 225"
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                            <TextInput
                                label="Reps"
                                value={reps}
                                onChangeText={setReps}
                                placeholder="1"
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>

                    <TextInput
                        label="Observações"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Como foi? Sentiu bem?"
                        multiline
                        numberOfLines={2}
                    />

                    <Button
                        label="Salvar Carga"
                        emoji="💾"
                        onPress={handleSave}
                        loading={loading}
                        disabled={!name.trim() || !weight}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
        paddingTop: spacing.sm,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    suggestions: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    suggestion: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    suggestionText: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    },
});