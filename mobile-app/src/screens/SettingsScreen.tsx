import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme';
import {
    getSetting,
    setSetting,
    getOpenAIKey,
    setOpenAIKey,
    getBarType,
} from '../services/database/settings';
import { logoutUser } from '../services/api/authApi';
import { useAuthStore } from '../store/useAuthStore';

import Card from '../components/Card';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import SegmentedControl from '../components/SegmentedControl';
import ScreenHeader from '../components/ScreenHeader';

const BAR_OPTIONS = [
    { label: 'Masculina (45lb)', value: 'male' },
    { label: 'Feminina (35lb)', value: 'female' },
];

type ThemeMode = 'dark' | 'light' | 'system';

const THEME_OPTIONS: {
    mode: ThemeMode;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    desc: string;
}[] = [
        {
            mode: 'dark',
            label: 'Escuro',
            icon: 'moon',
            desc: 'Fundo preto, ideal para treinos',
        },
        {
            mode: 'light',
            label: 'Claro',
            icon: 'sunny',
            desc: 'Fundo branco, melhor ao ar livre',
        },
        {
            mode: 'system',
            label: 'Sistema',
            icon: 'phone-portrait-outline',
            desc: 'Segue a configuração do iPhone',
        },
    ];

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { colors, mode: currentThemeMode, setMode: setThemeMode } = useTheme();

    const [openaiKey, setOpenaiKey] = useState('');
    const [barType, setBarTypeState] = useState('male');
    const [saving, setSaving] = useState(false);
    const [keyVisible, setKeyVisible] = useState(false);

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        const [key, bar] = await Promise.all([getOpenAIKey(), getBarType()]);
        setOpenaiKey(key);
        setBarTypeState(bar);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await Promise.all([
                setOpenAIKey(openaiKey.trim()),
                setSetting('bar_type', barType),
            ]);
            Alert.alert('Configurações salvas!', '', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e: any) {
            Alert.alert('Erro', e.message);
        } finally {
            setSaving(false);
        }
    }

    function handleLogout() {
        Alert.alert('Sair da conta', 'Tem certeza que quer sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    await logoutUser();
                    useAuthStore.getState().setUser(null);
                },
            },
        ]);
    }

    function maskedKey(key: string): string {
        if (!key || key.length < 8) return key;
        return key.slice(0, 7) + '•'.repeat(Math.max(key.length - 11, 4)) + key.slice(-4);
    }

    // Estilos dinâmicos que dependem do tema
    const dynStyles = getDynStyles(colors);

    return (
        <View style={dynStyles.root}>
            <ScreenHeader title="Configurações" />

            <ScrollView
                contentContainerStyle={dynStyles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Tema ── */}
                <SectionLabel title="Aparência" colors={colors} />
                <View style={dynStyles.themeRow}>
                    {THEME_OPTIONS.map((opt) => {
                        const isSelected = currentThemeMode === opt.mode;
                        return (
                            <TouchableOpacity
                                key={opt.mode}
                                style={[
                                    dynStyles.themeCard,
                                    isSelected && {
                                        borderColor: colors.orange,
                                        backgroundColor: colors.orangeFade,
                                    },
                                ]}
                                onPress={() => setThemeMode(opt.mode)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        dynStyles.themeIconWrap,
                                        isSelected && { backgroundColor: colors.orange + '25' },
                                    ]}
                                >
                                    <Ionicons
                                        name={opt.icon}
                                        size={22}
                                        color={isSelected ? colors.orange : colors.textMuted}
                                    />
                                </View>
                                <Text
                                    style={[
                                        dynStyles.themeLabel,
                                        isSelected && { color: colors.orange },
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                                <Text style={dynStyles.themeDesc}>{opt.desc}</Text>
                                {isSelected && (
                                    <View style={dynStyles.themeCheck}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={16}
                                            color={colors.orange}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── OpenAI ── */}
                <SectionLabel title="Inteligência Artificial" colors={colors} />
                <Card>
                    <Text style={dynStyles.settingDesc}>
                        A análise usa o GPT-4o mini. Você precisa de uma chave
                        própria da OpenAI — o custo é de centavos por análise.
                    </Text>
                    <TouchableOpacity
                        style={dynStyles.linkRow}
                        onPress={() =>
                            Linking.openURL('https://platform.openai.com/api-keys')
                        }
                    >
                        <Ionicons name="open-outline" size={14} color={colors.orange} />
                        <Text style={dynStyles.link}>
                            Obter chave em platform.openai.com
                        </Text>
                    </TouchableOpacity>

                    <View style={dynStyles.keyRow}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                label="Chave da API (sk-...)"
                                value={keyVisible ? openaiKey : maskedKey(openaiKey)}
                                onChangeText={setOpenaiKey}
                                placeholder="sk-proj-..."
                                autoCapitalize="none"
                            />
                        </View>
                        <TouchableOpacity
                            style={dynStyles.eyeBtn}
                            onPress={() => setKeyVisible(!keyVisible)}
                        >
                            <Ionicons
                                name={keyVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {openaiKey.length > 0 && (
                        <View style={dynStyles.keyStatus}>
                            <View
                                style={[
                                    dynStyles.keyDot,
                                    {
                                        backgroundColor: openaiKey.startsWith('sk-')
                                            ? colors.success
                                            : colors.error,
                                    },
                                ]}
                            />
                            <Text style={dynStyles.keyStatusText}>
                                {openaiKey.startsWith('sk-')
                                    ? 'Chave parece válida'
                                    : 'Deve começar com sk-'}
                            </Text>
                        </View>
                    )}
                </Card>

                {/* ── Preferências ── */}
                <SectionLabel title="Preferências" colors={colors} />
                <Card>
                    <SegmentedControl
                        label="Barra padrão na calculadora"
                        options={BAR_OPTIONS}
                        value={barType}
                        onChange={setBarTypeState}
                    />
                </Card>

                {/* ── Sobre ── */}
                <SectionLabel title="Sobre" colors={colors} />
                <Card>
                    {[
                        { label: 'Versão', value: '1.0.0 MVP' },
                        { label: 'Banco de dados', value: 'SQLite (local)' },
                        { label: 'Framework', value: 'React Native + Expo' },
                        { label: 'IA', value: 'OpenAI GPT-4o mini' },
                    ].map((item, i, arr) => (
                        <View
                            key={item.label}
                            style={[
                                dynStyles.infoRow,
                                i < arr.length - 1 && dynStyles.infoBorder,
                            ]}
                        >
                            <Text style={dynStyles.infoLabel}>{item.label}</Text>
                            <Text style={dynStyles.infoValue}>{item.value}</Text>
                        </View>
                    ))}
                </Card>

                <Button
                    label="Salvar configurações"
                    onPress={handleSave}
                    loading={saving}
                    style={dynStyles.saveBtn}
                />

                {/* ── Conta ── */}
                <SectionLabel title="Conta" colors={colors} />
                <TouchableOpacity
                    style={[dynStyles.logoutBtn, { borderColor: colors.error }]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={18} color={colors.error} />
                    <Text style={[dynStyles.logoutText, { color: colors.error }]}>
                        Sair da conta
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function SectionLabel({
    title,
    colors,
}: {
    title: string;
    colors: any;
}) {
    return (
        <Text
            style={{
                fontSize: 11,
                fontWeight: '700',
                color: colors.textMuted,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginTop: spacing.lg,
                marginBottom: spacing.sm,
                marginHorizontal: spacing.xs,
            }}
        >
            {title}
        </Text>
    );
}

// Estilos que dependem das cores do tema
function getDynStyles(colors: any) {
    return StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
        },

        // Tema
        themeRow: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        themeCard: {
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.sm,
            alignItems: 'center',
            position: 'relative',
        },
        themeIconWrap: {
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceLight,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 6,
        },
        themeLabel: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: 3,
        },
        themeDesc: {
            fontSize: 10,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 13,
        },
        themeCheck: {
            position: 'absolute',
            top: 6,
            right: 6,
        },

        // OpenAI
        settingDesc: {
            fontSize: 13,
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: spacing.md,
        },
        linkRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: spacing.md,
        },
        link: {
            fontSize: 13,
            color: colors.orange,
            fontWeight: '600',
        },
        keyRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
        },
        eyeBtn: {
            paddingBottom: spacing.md + 2,
            paddingLeft: 4,
        },
        keyStatus: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: -spacing.sm,
        },
        keyDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        keyStatusText: {
            fontSize: 12,
            color: colors.textSecondary,
        },

        // Info
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: spacing.sm + 2,
        },
        infoBorder: {
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        infoLabel: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        infoValue: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textPrimary,
        },

        saveBtn: {
            marginTop: spacing.lg,
        },

        logoutBtn: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderRadius: radius.lg,
            paddingVertical: spacing.sm + 4,
        },
        logoutText: {
            fontSize: 14,
            fontWeight: '700',
        },
    });
}