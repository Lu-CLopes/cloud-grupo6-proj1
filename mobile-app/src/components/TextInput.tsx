import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput as RNTextInput,
    StyleSheet,
    ViewStyle,
    KeyboardTypeOptions,
} from 'react-native';
import { colors, spacing, radius } from '../theme';

interface TextInputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: KeyboardTypeOptions;
    style?: ViewStyle;
    hint?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
}

export default function TextInput({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    style,
    hint,
    autoCapitalize = 'sentences',
    secureTextEntry = false,
}: TextInputProps) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <RNTextInput
                style={[
                    styles.input,
                    focused && styles.inputFocused,
                    multiline && {
                        height: Math.max(80, numberOfLines * 26),
                        textAlignVertical: 'top',
                        paddingTop: 12,
                    },
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                multiline={multiline}
                numberOfLines={numberOfLines}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                selectionColor={colors.orange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                secureTextEntry={secureTextEntry}
            />
            {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.surfaceLight,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '400',
    },
    inputFocused: {
        borderColor: colors.orange,
        backgroundColor: colors.surfaceHigh,
    },
    hint: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
});