// Funcionalidade #3 — Registro de um WOD.
// Mantém o mesmo formato de dados que a tela de WOD já usa
// (ver store/useWodStore) — só troca o SQLite local pela chamada remota.

import { apiRequest } from './client';
import { WodEntry } from '../../store/useWodStore';

export async function createWod(wod: Omit<WodEntry, 'id'>): Promise<WodEntry> {
  return apiRequest<WodEntry>('/wods', {
    method: 'POST',
    body: wod,
  });
}
