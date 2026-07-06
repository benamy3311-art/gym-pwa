import { create } from 'zustand';
import { signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthState {
    user: User | null;
    initializing: boolean;
    setUser: (user: User | null) => void;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    initializing: true,
    setUser: (user) => set({ user, initializing: false }),
    signInWithGoogle: async () => {
        if (!auth) return;
        await signInWithPopup(auth, googleProvider);
    },
    signOutUser: async () => {
        if (!auth) return;
        await signOut(auth);
    },
}));
