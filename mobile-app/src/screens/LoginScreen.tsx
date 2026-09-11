import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';

import { colors, spacing } from '../theme';
import { loginUser, registerUser } from '../services/api/authApi';
import { getApiHost, setApiHost, getSuggestedHost } from '../services/api/client';
import { useAuthStore } from '../store/useAuthStore';

import Button from '../components/Button';
import TextInput from '../components/TextInput';
import Card from '../components/Card';

export default function LoginScreen() {
    const setUser = useAuthStore((s) => s.setUser);

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Configuração do servidor precisa estar acessível aqui: login/cadastro
    // já dependem dela, e a tela de Configurações só existe depois de logado.
    const [serverHost, setServerHost] = useState('');
    const [showServerConfig, setShowServerConfig] = useState(false);

    useEffect(() => {
        getApiHost().then(setServerHost);
    }, []);

    async function handleSaveHost() {
        if (!serverHost.trim()) {
            Alert.alert('Endereço obrigatório', 'Informe o IP do servidor pra continuar.');
            return;
        }
        await setApiHost(serverHost);
        setShowServerConfig(false);
    }

    function handleDetectHost() {
        const suggested = getSuggestedHost();
        if (!suggested) {
            Alert.alert(
                'Não foi possível detectar',
                'Digite o IP manualmente (pegue com `ipconfig getifaddr en0` na máquina que roda o `vagrant up`).'
            );
            return;
        }
        setServerHost(suggested);
    }

    const isRegister = mode === 'register';
    const isValid =
        email.trim().length > 0 &&
        password.length >= 6 &&
        (!isRegister || name.trim().length > 0);

    async function handleSubmit() {
        if (!isValid) {
            Alert.alert(
                'Campos obrigatórios',
                isRegister
                    ? 'Preencha nome, email e uma senha com ao menos 6 caracteres.'
                    : 'Preencha email e senha.'
            );
            return;
        }

        setLoading(true);
        try {
            if (isRegister) {
                await registerUser(name.trim(), email.trim(), password);
                // Após cadastrar, já faz login automaticamente
                const user = await loginUser(email.trim(), password);
                setUser(user);
            } else {
                const user = await loginUser(email.trim(), password);
                setUser(user);
            }
        } catch (e: any) {
            Alert.alert('Erro', e.message ?? 'Não foi possível continuar.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.logo}>🏋️ CrossFit Tracker</Text>
                <Text style={styles.subtitle}>
                    {isRegister ? 'Crie sua conta pra começar' : 'Entre pra continuar seus treinos'}
                </Text>

                <Card style={styles.card}>
                    {isRegister && (
                        <TextInput
                            label="Nome"
                            value={name}
                            onChangeText={setName}
                            placeholder="Seu nome"
                            autoCapitalize="words"
                        />
                    )}

                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="voce@email.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        label="Senha"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Ao menos 6 caracteres"
                        secureTextEntry
                    />

                    <Button
                        label={isRegister ? 'Criar conta' : 'Entrar'}
                        emoji={isRegister ? '✨' : '🔑'}
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={!isValid}
                    />
                </Card>

                <Text
                    style={styles.switchText}
                    onPress={() => setMode(isRegister ? 'login' : 'register')}
                >
                    {isRegister
                        ? 'Já tem conta? Entrar'
                        : 'Ainda não tem conta? Criar agora'}
                </Text>

                <Text
                    style={styles.serverToggle}
                    onPress={() => setShowServerConfig((v) => !v)}
                >
                    {serverHost ? `⚙ Servidor: ${serverHost}` : '⚙ Configurar servidor'}
                </Text>

                {showServerConfig && (
                    <Card style={styles.card}>
                        <TextInput
                            label="Endereço do servidor"
                            value={serverHost}
                            onChangeText={setServerHost}
                            placeholder="192.168.0.10"
                            autoCapitalize="none"
                            keyboardType="numbers-and-punctuation"
                            hint="IP da máquina rodando o vagrant up, mesma Wi-Fi do celular"
                        />
                        <Button
                            label="Detectar automaticamente"
                            variant="secondary"
                            onPress={handleDetectHost}
                        />
                        <Button label="Salvar endereço" emoji="💾" onPress={handleSaveHost} />
                    </Card>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    logo: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    card: {
        gap: spacing.sm,
    },
    switchText: {
        marginTop: spacing.lg,
        textAlign: 'center',
        color: colors.info,
        fontWeight: '600',
    },
    serverToggle: {
        marginTop: spacing.xl,
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 12,
    },
});
