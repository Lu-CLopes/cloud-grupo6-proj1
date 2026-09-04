import { create } from 'zustand';

export interface ExerciseEntry {
    id: number;
    name: string;
    weight: number; // em lb
    reps?: number;
    date: string;
    isPR: boolean;
    notes?: string;
}

export interface Exercise {
    name: string;
    currentPR: number;
    history: ExerciseEntry[];
}

interface ExerciseState {
    exercises: Exercise[];
    recentPRs: ExerciseEntry[];
    setExercises: (exercises: Exercise[]) => void;
    setRecentPRs: (prs: ExerciseEntry[]) => void;
    addEntry: (entry: ExerciseEntry) => void;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
    exercises: [],
    recentPRs: [],
    setExercises: (exercises) => set({ exercises }),
    setRecentPRs: (prs) => set({ recentPRs: prs }),
    addEntry: (entry) =>
        set((state) => {
            const existing = state.exercises.find((e) => e.name === entry.name);
            if (existing) {
                const updatedPR = entry.weight > existing.currentPR
                    ? entry.weight
                    : existing.currentPR;
                return {
                    exercises: state.exercises.map((e) =>
                        e.name === entry.name
                            ? { ...e, currentPR: updatedPR, history: [entry, ...e.history] }
                            : e
                    ),
                };
            }
            return {
                exercises: [
                    ...state.exercises,
                    { name: entry.name, currentPR: entry.weight, history: [entry] },
                ],
            };
        }),
}));