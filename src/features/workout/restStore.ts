import { create } from 'zustand';

export interface RestSource {
    sessionId: string;
    entryId: string;
    exerciseId: string;
    exerciseName: string;
    setEntryId: string;
    setNumber: number;
}

interface RestState {
    isActive: boolean;
    remainingMs: number;
    totalMs: number;
    startedAt: number | null;
    source: RestSource | null;

    startRest: (ms: number, source?: RestSource) => void;
    extend: (ms: number) => void;
    skip: () => void;
    stop: () => void;
    tick: (now: number) => void;
}

export const useRestStore = create<RestState>((set, get) => ({
    isActive: false,
    remainingMs: 0,
    totalMs: 0,
    startedAt: null,
    source: null,

    startRest: (ms, source = undefined) => {
        set({
            isActive: true,
            totalMs: ms,
            remainingMs: ms,
            startedAt: Date.now(),
            source: source || null
        });
    },

    extend: (ms) => {
        const { isActive, totalMs, remainingMs } = get();
        if (!isActive) return;
        set({
            totalMs: totalMs + ms,
            remainingMs: remainingMs + ms
        });
    },

    skip: () => {
        set({ isActive: false, remainingMs: 0, totalMs: 0, startedAt: null, source: null });
    },

    stop: () => {
        set({ isActive: false, remainingMs: 0, totalMs: 0, startedAt: null, source: null });
    },

    tick: (now) => {
        const { isActive, startedAt, totalMs } = get();
        if (!isActive || !startedAt) return;

        const elapsed = now - startedAt;
        const remain = Math.max(0, totalMs - elapsed);

        if (remain === 0) {
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            set({ isActive: false, remainingMs: 0, startedAt: null, source: null });
        } else {
            set({ remainingMs: remain });
        }
    }
}));
