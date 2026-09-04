import { getDb } from './index';
import { ExerciseEntry, Exercise } from '../../store/useExerciseStore';

// ── Buscar todos os exercícios agrupados ────────────────────────
export async function fetchAllExercises(): Promise<Exercise[]> {
    const db = getDb();

    // Pega todos os nomes únicos de exercícios
    const names = await db.getAllAsync<{ name: string }>(
        `SELECT DISTINCT name FROM exercise_entries ORDER BY name ASC`
    );

    const exercises: Exercise[] = [];

    for (const { name } of names) {
        // PR atual (maior peso registrado)
        const prRow = await db.getFirstAsync<{ weight: number }>(
            `SELECT MAX(weight) as weight FROM exercise_entries WHERE name = ?`,
            [name]
        );

        // Histórico completo desse exercício
        const historyRows = await db.getAllAsync<any>(
            `SELECT * FROM exercise_entries 
       WHERE name = ? ORDER BY date DESC`,
            [name]
        );

        exercises.push({
            name,
            currentPR: prRow?.weight ?? 0,
            history: historyRows.map(rowToEntry),
        });
    }

    return exercises;
}

// ── Buscar PRs recentes (últimos 10) ────────────────────────────
export async function fetchRecentPRs(): Promise<ExerciseEntry[]> {
    const db = getDb();

    const rows = await db.getAllAsync<any>(
        `SELECT * FROM exercise_entries 
     WHERE is_pr = 1 
     ORDER BY date DESC, created_at DESC 
     LIMIT 10`
    );

    return rows.map(rowToEntry);
}

// ── Buscar histórico de um exercício específico ─────────────────
export async function fetchExerciseHistory(
    name: string
): Promise<ExerciseEntry[]> {
    const db = getDb();

    const rows = await db.getAllAsync<any>(
        `SELECT * FROM exercise_entries 
     WHERE name = ? ORDER BY date DESC`,
        [name]
    );

    return rows.map(rowToEntry);
}

// ── Inserir nova entrada de exercício ───────────────────────────
// Verifica automaticamente se é PR
export async function insertExerciseEntry(
    entry: Omit<ExerciseEntry, 'id' | 'isPR'>
): Promise<ExerciseEntry> {
    const db = getDb();

    // Busca o PR atual desse exercício
    const currentPRRow = await db.getFirstAsync<{ weight: number }>(
        `SELECT MAX(weight) as weight FROM exercise_entries WHERE name = ?`,
        [entry.name]
    );

    const currentPR = currentPRRow?.weight ?? 0;
    const isPR = entry.weight > currentPR ? 1 : 0;

    // Se for novo PR, remove o flag dos anteriores
    if (isPR) {
        await db.runAsync(
            `UPDATE exercise_entries SET is_pr = 0 WHERE name = ?`,
            [entry.name]
        );
    }

    const result = await db.runAsync(
        `INSERT INTO exercise_entries 
      (name, weight, reps, date, is_pr, wod_id, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            entry.name,
            entry.weight,
            entry.reps ?? null,
            entry.date,
            isPR,
            null,
            entry.notes ?? null,
        ]
    );

    return {
        ...entry,
        id: result.lastInsertRowId,
        isPR: isPR === 1,
    };
}

// ── Contar PRs totais ───────────────────────────────────────────
export async function countPRs(): Promise<number> {
    const db = getDb();
    const row = await db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(DISTINCT name) as total FROM exercise_entries`
    );
    return row?.total ?? 0;
}

// ── Buscar nomes de exercícios (para autocomplete) ──────────────
export async function fetchExerciseNames(): Promise<string[]> {
    const db = getDb();

    const rows = await db.getAllAsync<{ name: string }>(
        `SELECT DISTINCT name FROM exercise_entries ORDER BY name ASC`
    );

    // Exercícios padrão do CrossFit (sempre disponíveis)
    const defaults = [
        'Back Squat', 'Front Squat', 'Overhead Squat',
        'Deadlift', 'Romanian Deadlift', 'Sumo Deadlift',
        'Clean', 'Power Clean', 'Hang Power Clean',
        'Snatch', 'Power Snatch', 'Hang Power Snatch',
        'Clean & Jerk', 'Push Press', 'Push Jerk',
        'Strict Press', 'Bench Press',
        'Thruster', 'Wall Ball',
    ];

    const fromDb = rows.map((r) => r.name);
    const all = [...new Set([...fromDb, ...defaults])];
    return all.sort();
}

// ── Converter linha do banco para objeto ────────────────────────
function rowToEntry(row: any): ExerciseEntry {
    return {
        id: row.id,
        name: row.name,
        weight: row.weight,
        reps: row.reps ?? undefined,
        date: row.date,
        isPR: row.is_pr === 1,
        notes: row.notes ?? undefined,
    };
}