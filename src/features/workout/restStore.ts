import { create } from 'zustand';

interface RestState {
    isResting: boolean;
    restDuration: number;
    remainingSeconds: number;
    startRest: (duration: number) => void;
    stopRest: () => void;
    tick: () => void;
}

export const useRestStore = create<RestState>((set, get) => ({
    isResting: false,
    restDuration: 90,
    remainingSeconds: 0,

    startRest: (duration) => {
        set({ isResting: true, restDuration: duration, remainingSeconds: duration });
    },

    stopRest: () => {
        set({ isResting: false, remainingSeconds: 0 });
    },

    tick: () => {
        const { isResting, remainingSeconds } = get();
        if (!isResting) return;

        if (remainingSeconds <= 1) {
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
            set({ isResting: false, remainingSeconds: 0 });
        } else {
            set({ remainingSeconds: remainingSeconds - 1 });
        }
    }
}));
