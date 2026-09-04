import { getDb } from './index';
import { WodEntry } from '../../store/useWodStore';

// ── Buscar todos os WODs ────────────────────────────────────────
export async function fetchAllWods(): Promise<WodEntry[]> {
    const db = getDb();

    const rows = await db.getAllAsync<any>(
        `SELECT * FROM wods ORDER BY date DESC, created_at DESC`
    );

    return rows.map(rowToWod);
}

// ── Buscar WOD de hoje ──────────────────────────────────────────
export async function fetchTodayWod(): Promise<WodEntry | null> {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const row = await db.getFirstAsync<any>(
        `SELECT * FROM wods WHERE date = ? ORDER BY created_at DESC LIMIT 1`,
        [today]
    );

    return row ? rowToWod(row) : null;
}

// ── Buscar WOD por ID ───────────────────────────────────────────
export async function fetchWodById(id: number): Promise<WodEntry | null> {
    const db = getDb();

    const row = await db.getFirstAsync<any>(
        `SELECT * FROM wods WHERE id = ?`,
        [id]
    );

    return row ? rowToWod(row) : null;
}

// ── Inserir novo WOD ────────────────────────────────────────────
export async function insertWod(
    wod: Omit<WodEntry, 'id'>
): Promise<WodEntry> {
    const db = getDb();

    const result = await db.runAsync(
        `INSERT INTO wods 
      (date, title, type, focus, description, result, 
       intensity, fatigue, notes, hardest_exercise)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            wod.date,
            wod.title,
            wod.type,
            wod.focus,
            wod.description,
            wod.result ?? null,
            wod.intensity ?? null,
            wod.fatigue ?? null,
            wod.notes ?? null,
            wod.hardestExercise ?? null,
        ]
    );

    return { ...wod, id: result.lastInsertRowId };
}

// ── Atualizar WOD existente ─────────────────────────────────────
export async function updateWod(wod: WodEntry): Promise<void> {
    const db = getDb();

    await db.runAsync(
        `UPDATE wods SET
      title = ?, type = ?, focus = ?, description = ?,
      result = ?, intensity = ?, fatigue = ?,
      notes = ?, hardest_exercise = ?
     WHERE id = ?`,
        [
            wod.title,
            wod.type,
            wod.focus,
            wod.description,
            wod.result ?? null,
            wod.intensity ?? null,
            wod.fatigue ?? null,
            wod.notes ?? null,
            wod.hardestExercise ?? null,
            wod.id,
        ]
    );
}

// ── Deletar WOD ─────────────────────────────────────────────────
export async function deleteWod(id: number): Promise<void> {
    const db = getDb();
    await db.runAsync(`DELETE FROM wods WHERE id = ?`, [id]);
}

// ── Contar WODs totais ──────────────────────────────────────────
export async function countWods(): Promise<number> {
    const db = getDb();
    const row = await db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) as total FROM wods`
    );
    return row?.total ?? 0;
}

// ── Calcular streak atual ───────────────────────────────────────
// Conta quantos dias consecutivos (até hoje) têm pelo menos 1 WOD
export async function calculateStreak(): Promise<number> {
    const db = getDb();

    const rows = await db.getAllAsync<{ date: string }>(
        `SELECT DISTINCT date FROM wods ORDER BY date DESC`
    );

    if (rows.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < rows.length; i++) {
        const wodDate = new Date(rows[i].date + 'T00:00:00');
        const diffDays = Math.round(
            (today.getTime() - wodDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Primeiro item: deve ser hoje ou ontem pra streak existir
        if (i === 0 && diffDays > 1) return 0;

        // Dias consecutivos: diferença deve ser exatamente i dias
        if (diffDays === i) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// ── Converter linha do banco para objeto ────────────────────────
function rowToWod(row: any): WodEntry {
    return {
        id: row.id,
        date: row.date,
        title: row.title,
        type: row.type,
        focus: row.focus,
        description: row.description,
        result: row.result ?? undefined,
        intensity: row.intensity ?? undefined,
        fatigue: row.fatigue ?? undefined,
        notes: row.notes ?? undefined,
        hardestExercise: row.hardest_exercise ?? undefined,
    };
}