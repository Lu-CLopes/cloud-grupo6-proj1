// Funcionalidade #4 — Registro de execução de exercício (com detecção de PR).
// A resposta já vem com `isPR: true/false` calculado pelo backend
// (ver app-server/models/exerciseEntryModel.js).

import { apiRequest } from './client';

export type ExerciseEntryInput = {
  exerciseName: string;
  weight: number;
  reps?: number;
  sets?: number;
  date: string;
  notes?: string;
  wodId?: number;
};

export type ExerciseEntryResult = ExerciseEntryInput & { id: number; isPR: boolean };

export async function createExerciseEntry(
  entry: ExerciseEntryInput
): Promise<ExerciseEntryResult> {
  return apiRequest<ExerciseEntryResult>('/exercise-entries', {
    method: 'POST',
    body: entry,
  });
}
