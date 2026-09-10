import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { MainTabParamList, RootStackParamList } from './types';
import { useAuthStore } from '../store/useAuthStore';
import { bootstrapAuth } from '../services/api/authApi';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import NewWodScreen from '../screens/NewWodScreen';
import WodDetailScreen from '../screens/WodDetailScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<
    keyof MainTabParamList,
    { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] }
> = {
    Dashboard: { active: 'home', inactive: 'home-outline' },
    History: { active: 'time', inactive: 'time-outline' },
    Calculator: { active: 'calculator', inactive: 'calculator-outline' },
    Exercises: { active: 'barbell', inactive: 'barbell-outline' },
};

function MainTabs() {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.orange,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    const icon = TAB_ICONS[route.name as keyof MainTabParamList];
                    return (
                        <Ionicons
                            name={focused ? icon.active : icon.inactive}
                            size={size}
                            color={color}
                        />
                    );
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ tabBarLabel: 'Início' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarLabel: 'Histórico' }}
            />
            <Tab.Screen
                name="Calculator"
                component={CalculatorScreen}
                options={{ tabBarLabel: 'Calculadora' }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExerciseScreen}
                options={{ tabBarLabel: 'Exercícios' }}
            />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    const { colors } = useTheme();
    const { user, isBootstrapping, setUser, setBootstrapping } = useAuthStore();

    // Ao abrir o app, tenta restaurar a sessão salva (token + usuário)
    useEffect(() => {
        bootstrapAuth()
            .then((restoredUser) => setUser(restoredUser))
            .finally(() => setBootstrapping(false));
    }, []);

    if (isBootstrapping) {
        return (
            <View style={[styles.loading, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.info} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                }}
            >
                {!user ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="NewWod" component={NewWodScreen} />
                        <Stack.Screen name="WodDetail" component={WodDetailScreen} />
                        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
