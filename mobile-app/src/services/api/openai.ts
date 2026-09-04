import { getOpenAIKey } from '../database/settings';
import { WodEntry } from '../../store/useWodStore';

const API_URL = 'https://api.openai.com/v1/chat/completions';

// ── Função principal: analisa um WOD ────────────────────────────
export async function analyzeWod(wod: WodEntry): Promise<string> {
    const apiKey = await getOpenAIKey();

    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API key não configurada');
    }

    const prompt = buildWodPrompt(wod);

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 600,
            temperature: 0.7,
            messages: [
                {
                    role: 'system',
                    content: buildSystemPrompt(),
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error('API key inválida. Verifique nas configurações.');
        }
        if (response.status === 429) {
            throw new Error('Limite de uso da API atingido. Tente mais tarde.');
        }
        throw new Error(err?.error?.message ?? `Erro ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? 'Sem resposta da IA.';
}

// ── Analisa padrões de múltiplos WODs ──────────────────────────
export async function analyzePatterns(
    wods: WodEntry[]
): Promise<string> {
    const apiKey = await getOpenAIKey();

    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API key não configurada');
    }

    const summary = wods.slice(0, 10).map((w) => ({
        titulo: w.title,
        tipo: w.type,
        foco: w.focus,
        intensidade: w.intensity,
        fadiga: w.fatigue,
        resultado: w.result,
        data: w.date,
    }));

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 800,
            temperature: 0.7,
            messages: [
                {
                    role: 'system',
                    content: buildSystemPrompt(),
                },
                {
                    role: 'user',
                    content:
                        `Analise os padrões dos últimos ${summary.length} treinos:\n\n` +
                        JSON.stringify(summary, null, 2) +
                        '\n\nIdentifique: pontos fortes, pontos a melhorar, ' +
                        'padrões de fadiga, e recomendações para as próximas semanas.',
                },
            ],
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `Erro ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? 'Sem resposta da IA.';
}

// ── Sistema prompt (personalidade do coach) ─────────────────────
function buildSystemPrompt(): string {
    return `Você é um coach de CrossFit experiente e analítico.
Seu papel é analisar treinos, identificar padrões de performance e dar feedback construtivo.

Regras:
- Seja direto e objetivo, sem rodeios
- Use linguagem de atleta (não corporativa)
- Sempre termine com 1-2 sugestões concretas e acionáveis
- Máximo 4 parágrafos curtos
- Responda sempre em português brasileiro
- Use emojis com moderação para destacar pontos importantes`;
}

// ── Monta o prompt com os dados do WOD ─────────────────────────
function buildWodPrompt(wod: WodEntry): string {
    const lines: string[] = [
        `Treino: ${wod.title}`,
        `Tipo: ${wod.type} | Foco: ${wod.focus}`,
        `Data: ${wod.date}`,
        '',
        `Descrição:\n${wod.description}`,
    ];

    if (wod.result) lines.push(`\nResultado: ${wod.result}`);
    if (wod.intensity) lines.push(`Intensidade percebida: ${wod.intensity}/10`);
    if (wod.fatigue) lines.push(`Fadiga: ${wod.fatigue}/10`);
    if (wod.hardestExercise) lines.push(`Exercício mais difícil: ${wod.hardestExercise}`);
    if (wod.notes) lines.push(`Observações do atleta: ${wod.notes}`);

    lines.push(
        '\nAnalise este treino e dê feedback sobre: performance geral, ' +
        'pontos de atenção e o que focar no próximo treino similar.'
    );

    return lines.join('\n');
}