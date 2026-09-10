export function formatDate(date: Date = new Date()): string {
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatShortDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });
}

// A API retorna colunas DATE do MySQL como string ISO completa
// (ex: "2026-09-09T00:00:00.000Z"). Usar isso pra extrair só "YYYY-MM-DD".
export function toDateOnly(value: string): string {
    return String(value).slice(0, 10);
}

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

export function formatWeight(weight: number): string {
    return `${weight} lb`;
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}