import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeOption = 'dark' | 'light' | 'system';

interface ThemeState {
    theme: ThemeOption;
    setTheme: (theme: ThemeOption) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'dark', // Default to ruby dark theme
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'gym-pwa-theme',
        }
    )
);
