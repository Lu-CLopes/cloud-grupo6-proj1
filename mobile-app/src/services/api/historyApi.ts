// Funcionalidade #5 — Consulta do histórico do usuário (WODs + exercícios).

import { apiRequest } from './client';

export type HistoryResponse = {
  wods: any[];
  exerciseEntries: any[];
};

export async function fetchHistory(userId: number): Promise<HistoryResponse> {
  return apiRequest<HistoryResponse>(`/users/${userId}/history`);
}
