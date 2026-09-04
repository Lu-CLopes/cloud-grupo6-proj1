import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing } from '../theme';
import { createWod } from '../services/api/wodApi';
import { useWodStore, WodEntry } from '../store/useWodStore';
import { useAppStore } from '../store/useAppStore';

import Button from '../components/Button';
import TextInput from '../components/TextInput';
import SegmentedControl from '../components/SegmentedControl';
import SliderInput from '../components/SliderInput';
import Card from '../components/Card';
import ScreenHeader from '../components/ScreenHeader';

const WOD_TYPES = [
    { label: 'AMRAP', value: 'AMRAP', color: colors.orange },
    { label: 'EMOM', value: 'EMOM', color: colors.purple },
    { label: 'For Time', value: 'For Time', color: colors.info },
    { label: 'Strength', value: 'Strength', color: colors.success },
    { label: 'Hero', value: 'Hero', color: colors.error },
    { label: 'Outro', value: 'Outro', color: colors.textMuted },
];

const WOD_FOCUS = [
    { label: 'Cardio', value: 'Cardio' },
    { label: 'Força', value: 'Força' },
    { label: 'Ginástico', value: 'Ginástico' },
    { label: 'Misto', value: 'Misto' },
];

export default function NewWodScreen() {
    const navigation = useNavigation();
    const { addWod, setTodayWod } = useWodStore();
    const { incrementWods } = useAppStore();

    const [type, setType] = useState<WodEntry['type']>('AMRAP');
    const [focus, setFocus] = useState<WodEntry['focus']>('Misto');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [result, setResult] = useState('');
    const [intensity, setIntensity] = useState(7);
    const [fatigue, setFatigue] = useState(6);
    const [hardestExercise, setHardestExercise] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const isValid = title.trim().length > 0 && description.trim().length > 0;

    async function handleSave() {
        if (!isValid) {
            Alert.alert('Campos obrigatórios', 'Preencha o título e a descrição.');
            return;
        }
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const saved = await createWod({
                date: today,
                title: title.trim(),
                type,
                focus,
                description: description.trim(),
                result: result.trim() || undefined,
                intensity,
                fatigue,
                notes: notes.trim() || undefined,
                hardestExercise: hardestExercise.trim() || undefined,
            });
            addWod(saved);
            setTodayWod(saved);
            incrementWods();
            Alert.alert('WOD salvo!', 'Treino registrado com sucesso.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e: any) {
            Alert.alert('Erro', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScreenHeader title="Novo WOD" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.section}>
                    <SegmentedControl
                        label="Tipo de WOD"
                        options={WOD_TYPES}
                        value={type}
                        onChange={(v) => setType(v as WodEntry['type'])}
                        scrollable
                    />
                    <SegmentedControl
                        label="Foco"
                        options={WOD_FOCUS}
                        value={focus}
                        onChange={(v) => setFocus(v as WodEntry['focus'])}
                    />
                </Card>

                <Card style={styles.section}>
                    <TextInput
                        label="Título *"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ex: Fran, Murph, Kelly..."
                    />
                    <TextInput
                        label="Descrição / Movimentos *"
                        value={description}
                        onChangeText={setDescription}
                        placeholder={
                            type === 'AMRAP' ? 'Ex: 12min AMRAP\n10 Pull-ups\n20 Push-ups\n30 Air Squats' :
                                type === 'EMOM' ? 'Ex: 10min EMOM\nMin 1: 15 Cal Row\nMin 2: 10 Burpees' :
                                    type === 'For Time' ? 'Ex: 21-15-9\nThrusters 95lb\nPull-ups' :
                                        'Descreva o treino...'
                        }
                        multiline
                        numberOfLines={6}
                    />
                    <TextInput
                        label="Resultado"
                        value={result}
                        onChangeText={setResult}
                        placeholder={
                            type === 'AMRAP' ? 'Ex: 8 rounds + 5 reps' :
                                type === 'For Time' ? 'Ex: 12:34' :
                                    'Ex: 5x5 @ 225lb'
                        }
                        hint="Opcional — tempo, rounds, peso usado..."
                    />
                </Card>

                <Card style={styles.section}>
                    <SliderInput
                        label="Intensidade"
                        value={intensity}
                        onChange={setIntensity}
                    />
                    <SliderInput
                        label="Fadiga"
                        value={fatigue}
                        onChange={setFatigue}
                    />
                </Card>

                <Card style={styles.section}>
                    <TextInput
                        label="Exercício mais difícil"
                        value={hardestExercise}
                        onChangeText={setHardestExercise}
                        placeholder="Ex: Muscle-ups, Handstand Walk..."
                    />
                    <TextInput
                        label="Observações"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Como você se sentiu? O que pode melhorar?"
                        multiline
                        numberOfLines={3}
                    />
                </Card>

                <Button
                    label="Salvar WOD"
                    onPress={handleSave}
                    loading={loading}
                    disabled={!isValid}
                    style={styles.saveBtn}
                />

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: { flex: 1 },
    content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
    },
    section: {
        marginBottom: spacing.md,
    },
    saveBtn: {
        marginTop: spacing.md,
    },
});