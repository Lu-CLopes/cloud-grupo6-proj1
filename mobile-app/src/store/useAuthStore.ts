import { create } from 'zustand';
import { AuthUser } from '../services/api/authApi';

interface AuthState {
    user: AuthUser | null;
    isBootstrapping: boolean; // true enquanto restaura a sessão salva
    setUser: (user: AuthUser | null) => void;
    setBootstrapping: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isBootstrapping: true,
    setUser: (user) => set({ user }),
    setBootstrapping: (value) => set({ isBootstrapping: value }),
}));
