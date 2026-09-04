import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

const fontFamily = Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
});

export const typography = StyleSheet.create({
    // ── Display ──────────────────────────────────
    display: {
        fontFamily,
        fontSize: 40,
        fontWeight: '800' as const,
        color: colors.textPrimary,
        letterSpacing: -1.5,
        lineHeight: 46,
    },

    // ── Headings ─────────────────────────────────
    h1: {
        fontFamily,
        fontSize: 30,
        fontWeight: '800' as const,
        color: colors.textPrimary,
        letterSpacing: -0.8,
        lineHeight: 36,
    },
    h2: {
        fontFamily,
        fontSize: 22,
        fontWeight: '700' as const,
        color: colors.textPrimary,
        letterSpacing: -0.4,
        lineHeight: 28,
    },
    h3: {
        fontFamily,
        fontSize: 17,
        fontWeight: '600' as const,
        color: colors.textPrimary,
        letterSpacing: -0.2,
        lineHeight: 22,
    },

    // ── Body ─────────────────────────────────────
    body: {
        fontFamily,
        fontSize: 15,
        fontWeight: '400' as const,
        color: colors.textPrimary,
        lineHeight: 22,
    },
    bodySmall: {
        fontFamily,
        fontSize: 13,
        fontWeight: '400' as const,
        color: colors.textSecondary,
        lineHeight: 18,
    },

    // ── UI ───────────────────────────────────────
    label: {
        fontFamily,
        fontSize: 11,
        fontWeight: '700' as const,
        color: colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase' as const,
        lineHeight: 14,
    },
    caption: {
        fontFamily,
        fontSize: 11,
        fontWeight: '500' as const,
        color: colors.textMuted,
        lineHeight: 14,
    },
    button: {
        fontFamily,
        fontSize: 15,
        fontWeight: '700' as const,
        letterSpacing: 0.2,
        lineHeight: 20,
    },
    mono: {
        fontFamily: Platform.select({ ios: 'Courier New', default: 'monospace' }),
        fontSize: 14,
        fontWeight: '500' as const,
        color: colors.textPrimary,
        lineHeight: 22,
    },
    // ── Número grande (PR, peso, stats) ──────────
    statNumber: {
        fontFamily,
        fontSize: 32,
        fontWeight: '800' as const,
        letterSpacing: -1,
        lineHeight: 38,
    },
});