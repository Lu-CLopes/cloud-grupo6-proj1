export interface ColorScheme {
    background: string;
    surface: string;
    surfaceLight: string;
    surfaceHigh: string;
    border: string;
    borderLight: string;

    orange: string;
    orangeLight: string;
    orangeDark: string;
    orangeFade: string;

    purple: string;
    purpleLight: string;
    purpleDark: string;
    purpleFade: string;

    success: string;
    successFade: string;
    warning: string;
    warningFade: string;
    error: string;
    errorFade: string;
    info: string;
    infoFade: string;

    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;

    prGold: string;
    prGoldFade: string;

    white: string;
    black: string;
}

export const dark: ColorScheme = {
    background: '#0A0A0F',
    surface: '#13131A',
    surfaceLight: '#1C1C26',
    surfaceHigh: '#252533',
    border: '#2A2A3A',
    borderLight: '#3A3A4A',

    orange: '#FF6B00',
    orangeLight: '#FF8C3A',
    orangeDark: '#CC5500',
    orangeFade: '#FF6B0015',

    purple: '#7C3AED',
    purpleLight: '#9D5FF3',
    purpleDark: '#5B21B6',
    purpleFade: '#7C3AED15',

    success: '#22C55E',
    successFade: '#22C55E15',
    warning: '#F59E0B',
    warningFade: '#F59E0B15',
    error: '#EF4444',
    errorFade: '#EF444415',
    info: '#3B82F6',
    infoFade: '#3B82F615',

    textPrimary: '#F0F0F8',
    textSecondary: '#8A8AA0',
    textMuted: '#4A4A60',
    textInverse: '#0A0A0F',

    prGold: '#FFD700',
    prGoldFade: '#FFD70018',

    white: '#FFFFFF',
    black: '#000000',
};

export const light: ColorScheme = {
    background: '#F4F4F8',
    surface: '#FFFFFF',
    surfaceLight: '#F0F0F5',
    surfaceHigh: '#E8E8F0',
    border: '#E0E0EA',
    borderLight: '#CACAD8',

    orange: '#FF6B00',
    orangeLight: '#FF8C3A',
    orangeDark: '#CC5500',
    orangeFade: '#FF6B0012',

    purple: '#7C3AED',
    purpleLight: '#9D5FF3',
    purpleDark: '#5B21B6',
    purpleFade: '#7C3AED12',

    success: '#16A34A',
    successFade: '#16A34A12',
    warning: '#D97706',
    warningFade: '#D9770612',
    error: '#DC2626',
    errorFade: '#DC262612',
    info: '#2563EB',
    infoFade: '#2563EB12',

    textPrimary: '#0A0A0F',
    textSecondary: '#52526A',
    textMuted: '#9090A8',
    textInverse: '#F0F0F8',

    prGold: '#B8860B',
    prGoldFade: '#B8860B18',

    white: '#FFFFFF',
    black: '#000000',
};

// Exporta dark como padrão pra não quebrar imports existentes
export const colors: ColorScheme = dark;