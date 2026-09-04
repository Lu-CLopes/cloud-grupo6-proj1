import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, ColorScheme } from './colors';
import { setSetting, getSetting } from '../services/database/settings';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
    colors: ColorScheme;
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
    colors: dark,
    mode: 'dark',
    isDark: true,
    setMode: async () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('dark');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const saved = await getSetting('theme_mode');
                if (saved === 'dark' || saved === 'light' || saved === 'system') {
                    setModeState(saved as ThemeMode);
                }
            } catch {
                // banco ainda não iniciado — usa dark como padrão
            } finally {
                setReady(true);
            }
        }
        load();
    }, []);

    const isDark: boolean =
        mode === 'dark' ? true :
            mode === 'light' ? false :
                systemScheme === 'dark';

    // Cast explícito pra garantir o tipo ColorScheme
    const activeColors: ColorScheme = isDark ? dark : light;

    const setMode = useCallback(async (newMode: ThemeMode) => {
        setModeState(newMode);
        try {
            await setSetting('theme_mode', newMode);
        } catch {
            // silencia erro
        }
    }, []);

    if (!ready) return null;

    return (
        <ThemeContext.Provider
            value={{
                colors: activeColors,
                mode,
                isDark,
                setMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}