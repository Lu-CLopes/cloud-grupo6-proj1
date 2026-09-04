import { create } from 'zustand';

export interface WodEntry {
    id: number;
    date: string;
    type: 'AMRAP' | 'EMOM' | 'For Time' | 'Strength' | 'Hero' | 'Outro';
    title: string;
    description: string;
    result?: string;
    intensity?: number;
    fatigue?: number;
    notes?: string;
    hardestExercise?: string;
    focus: 'Cardio' | 'Força' | 'Ginástico' | 'Misto';
}

interface WodState {
    wods: WodEntry[];
    todayWod: WodEntry | null;
    setWods: (wods: WodEntry[]) => void;
    addWod: (wod: WodEntry) => void;
    setTodayWod: (wod: WodEntry | null) => void;
}

export const useWodStore = create<WodState>((set) => ({
    wods: [],
    todayWod: null,
    setWods: (wods) => set({ wods }),
    addWod: (wod) => set((state) => ({ wods: [wod, ...state.wods] })),
    setTodayWod: (wod) => set({ todayWod: wod }),
}));