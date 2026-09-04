import { create } from 'zustand';

interface AppState {
    // Estatísticas gerais
    totalWods: number;
    currentStreak: number;
    totalPRs: number;

    // Ações
    setTotalWods: (n: number) => void;
    setCurrentStreak: (n: number) => void;
    setTotalPRs: (n: number) => void;
    incrementWods: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    totalWods: 0,
    currentStreak: 0,
    totalPRs: 0,

    setTotalWods: (n) => set({ totalWods: n }),
    setCurrentStreak: (n) => set({ currentStreak: n }),
    setTotalPRs: (n) => set({ totalPRs: n }),
    incrementWods: () => set((state) => ({ totalWods: state.totalWods + 1 })),
}));