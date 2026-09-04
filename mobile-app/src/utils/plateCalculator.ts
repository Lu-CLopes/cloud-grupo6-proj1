// Anilhas disponíveis no CrossFit (em lb), da maior pra menor
export const AVAILABLE_PLATES = [45, 35, 25, 15, 10, 5, 2.5];

export type BarType = 'male' | 'female';
export const BAR_WEIGHT: Record<BarType, number> = {
    male: 45,
    female: 35,
};

export interface PlateResult {
    plate: number;
    count: number; // por lado
}

export interface CalculationResult {
    totalWeight: number;
    barWeight: number;
    weightPerSide: number;
    plates: PlateResult[];   // anilhas por lado
    isExact: boolean;
    remainder: number;       // peso que não foi possível montar (ideal = 0)
}

// ── Calcula a melhor combinação de anilhas ──────────────────────
// Algoritmo greedy: usa a maior anilha possível a cada passo
export function calculatePlates(
    targetWeight: number,
    barType: BarType
): CalculationResult {
    const barWeight = BAR_WEIGHT[barType];
    const weightPerSide = (targetWeight - barWeight) / 2;

    if (weightPerSide < 0) {
        return {
            totalWeight: barWeight,
            barWeight,
            weightPerSide: 0,
            plates: [],
            isExact: targetWeight === barWeight,
            remainder: 0,
        };
    }

    const plates: PlateResult[] = [];
    let remaining = weightPerSide;

    for (const plate of AVAILABLE_PLATES) {
        if (remaining <= 0) break;

        const count = Math.floor(remaining / plate);
        if (count > 0) {
            plates.push({ plate, count });
            remaining -= plate * count;
            // Arredonda pra evitar floating point ex: 0.0000001
            remaining = Math.round(remaining * 100) / 100;
        }
    }

    const actualPerSide = plates.reduce(
        (sum, p) => sum + p.plate * p.count,
        0
    );
    const actualTotal = barWeight + actualPerSide * 2;

    return {
        totalWeight: actualTotal,
        barWeight,
        weightPerSide: actualPerSide,
        plates,
        isExact: remaining === 0,
        remainder: remaining,
    };
}

// ── Calcula progressão de cargas ────────────────────────────────
// Dado um peso inicial e uma progressão em %,
// retorna a sequência de cargas e as anilhas de cada etapa
export interface ProgressionStep {
    step: number;
    targetWeight: number;
    result: CalculationResult;
    // Diferença em relação ao passo anterior (anilhas a ADICIONAR)
    platesToAdd: PlateResult[];
    // Anilhas a REMOVER em relação ao passo anterior
    platesToRemove: PlateResult[];
}

export function calculateProgression(
    startWeight: number,
    barType: BarType,
    steps: number = 5,
    increment: number = 0.1  // 10% por padrão
): ProgressionStep[] {
    const results: ProgressionStep[] = [];
    let previousPlates: PlateResult[] = [];

    for (let i = 0; i < steps; i++) {
        const targetWeight =
            Math.round((startWeight * (1 + increment * i)) / 2.5) * 2.5;

        const result = calculatePlates(targetWeight, barType);

        // Calcula diferença de anilhas em relação ao passo anterior
        const { toAdd, toRemove } = diffPlates(previousPlates, result.plates);

        results.push({
            step: i + 1,
            targetWeight,
            result,
            platesToAdd: toAdd,
            platesToRemove: toRemove,
        });

        previousPlates = result.plates;
    }

    return results;
}

// ── Diferença entre duas configurações de anilhas ───────────────
function diffPlates(
    before: PlateResult[],
    after: PlateResult[]
): { toAdd: PlateResult[]; toRemove: PlateResult[] } {
    const toAdd: PlateResult[] = [];
    const toRemove: PlateResult[] = [];

    const allPlates = new Set([
        ...before.map((p) => p.plate),
        ...after.map((p) => p.plate),
    ]);

    for (const plate of allPlates) {
        const beforeCount = before.find((p) => p.plate === plate)?.count ?? 0;
        const afterCount = after.find((p) => p.plate === plate)?.count ?? 0;

        if (afterCount > beforeCount) {
            toAdd.push({ plate, count: afterCount - beforeCount });
        } else if (afterCount < beforeCount) {
            toRemove.push({ plate, count: beforeCount - afterCount });
        }
    }

    return { toAdd, toRemove };
}

// ── Formata a barra visualmente ──────────────────────────────────
// Retorna string tipo: [45][25][10][5] | BAR | [5][10][25][45]
export function formatBarVisual(result: CalculationResult): string {
    const side = result.plates
        .flatMap((p) => Array(p.count).fill(`[${p.plate}]`))
        .join('');
    const bar = `| ${result.barWeight}lb BAR |`;
    const reversed = result.plates
        .flatMap((p) => Array(p.count).fill(`[${p.plate}]`))
        .reverse()
        .join('');
    return `${side}${bar}${reversed}`;
}