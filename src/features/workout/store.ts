import { create } from 'zustand';
import { WorkoutSession, WorkoutExerciseEntry, SetEntry } from '../../domain/models';
import { WorkoutRepo, PRRepo } from '../../data/repositories';
import { determineNewPRs } from '../../domain/prLogic';

interface WorkoutState {
    activeSession: WorkoutSession | null;
    entries: WorkoutExerciseEntry[];
    setsByEntry: Record<string, SetEntry[]>;
    previousSetsByExercise: Record<string, SetEntry[]>;
    isLoading: boolean;
    lastDoneSet: { setId: string; entryId: string; exerciseId: string } | null;

    startWorkout: (name: string, templateId?: string) => Promise<void>;
    finishWorkout: () => Promise<void>;
    addExercise: (exerciseId: string) => Promise<void>;
    addSet: (entryId: string, explicitWeight?: number, explicitReps?: number) => Promise<void>;
    updateSet: (setId: string, entryId: string, updates: Partial<SetEntry>) => Promise<void>;
    toggleSetDone: (setId: string, entryId: string, exerciseId: string) => Promise<void>;
    undoLastSet: () => Promise<void>;
    removeSet: (setId: string, entryId: string) => Promise<void>;
    removeExercise: (entryId: string) => Promise<void>;
    cancelWorkout: () => Promise<void>;
    loadActiveWorkout: () => Promise<void>;
    loadPreviousSets: (exerciseId: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    activeSession: null,
    entries: [],
    setsByEntry: {},
    previousSetsByExercise: {},
    isLoading: false,
    lastDoneSet: null,

    startWorkout: async (name, templateId) => {
        set({ isLoading: true });
        const session = await WorkoutRepo.startSession(name, templateId);
        set({ activeSession: session, entries: [], setsByEntry: {}, isLoading: false });
    },

    finishWorkout: async () => {
        const { activeSession } = get();
        if (!activeSession) return;
        await WorkoutRepo.finishSession(activeSession.id);
        set({ activeSession: null, entries: [], setsByEntry: {} });
    },

    cancelWorkout: async () => {
        const { activeSession } = get();
        if (!activeSession) return;
        await WorkoutRepo.deleteSession(activeSession.id);
        set({ activeSession: null, entries: [], setsByEntry: {} });
    },

    loadActiveWorkout: async () => {
        set({ isLoading: true });
        const sessions = await WorkoutRepo.getAllSessions();
        const active = sessions.find(s => !s.endedAt);

        if (active) {
            const entries = await WorkoutRepo.getSessionExercises(active.id);
            const setsByEntry: Record<string, SetEntry[]> = {};
            for (const entry of entries) {
                setsByEntry[entry.id] = await WorkoutRepo.getSetsForEntry(entry.id);
            }
            set({ activeSession: active, entries, setsByEntry, isLoading: false });
        } else {
            set({ activeSession: null, entries: [], setsByEntry: {}, isLoading: false });
        }
    },

    addExercise: async (exerciseId) => {
        const { activeSession, entries } = get();
        if (!activeSession) return;
        const order = entries.length;
        const entry = await WorkoutRepo.addExerciseToSession(activeSession.id, exerciseId, order);

        const firstSet = await WorkoutRepo.addSet(entry.id, 1, 0, 0);

        set((state) => ({
            entries: [...state.entries, entry],
            setsByEntry: { ...state.setsByEntry, [entry.id]: [firstSet] }
        }));
    },

    addSet: async (entryId, explicitWeight?: number, explicitReps?: number) => {
        const { setsByEntry, previousSetsByExercise, entries } = get();
        const currentSets = setsByEntry[entryId] || [];
        const setNumber = currentSets.length + 1;

        // Smart Autocomplete
        let weight = explicitWeight || 0;
        let reps = explicitReps || 0;

        if (weight === 0 && reps === 0) {
            if (currentSets.length > 0) {
                weight = currentSets[currentSets.length - 1].weight;
                reps = currentSets[currentSets.length - 1].reps;
            } else {
                const entry = entries.find(e => e.id === entryId);
                if (entry) {
                    const prev = previousSetsByExercise[entry.exerciseId]?.[setNumber - 1];
                    if (prev) {
                        weight = prev.weight;
                        reps = prev.reps;
                    }
                }
            }
        }

        const newSet = await WorkoutRepo.addSet(entryId, setNumber, weight, reps);

        set((state) => ({
            setsByEntry: {
                ...state.setsByEntry,
                [entryId]: [...(state.setsByEntry[entryId] || []), newSet]
            }
        }));
    },

    updateSet: async (setId, entryId, updates) => {
        await WorkoutRepo.updateSet(setId, updates);
        set((state) => ({
            setsByEntry: {
                ...state.setsByEntry,
                [entryId]: (state.setsByEntry[entryId] || []).map(s => s.id === setId ? { ...s, ...updates } : s)
            }
        }));
    },

    toggleSetDone: async (setId, entryId, exerciseId) => {
        const { setsByEntry, activeSession } = get();
        if (!activeSession) return;

        const currentSets = setsByEntry[entryId] || [];
        const setTarget = currentSets.find(s => s.id === setId);
        if (!setTarget) return;

        const newIsDone = !setTarget.isDone;
        await WorkoutRepo.updateSet(setId, { isDone: newIsDone });

        const updatedSets = currentSets.map(s => s.id === setId ? { ...s, isDone: newIsDone } : s);
        set((state) => ({
            setsByEntry: { ...state.setsByEntry, [entryId]: updatedSets },
            lastDoneSet: newIsDone ? { setId, entryId, exerciseId } : state.lastDoneSet
        }));

        if (newIsDone) {
            const existingPRs = await PRRepo.getPRsForExercise(exerciseId);
            const newPRs = determineNewPRs(exerciseId, { ...setTarget, isDone: true }, existingPRs, activeSession.id);
            if (newPRs.length > 0) {
                await PRRepo.savePRs(newPRs);
            }
        }
    },

    undoLastSet: async () => {
        const { lastDoneSet, setsByEntry } = get();
        if (!lastDoneSet) return;

        const { setId, entryId } = lastDoneSet;
        await WorkoutRepo.updateSet(setId, { isDone: false });

        // We intentionally don't revert PR records, as that's complex and usually fine to keep
        const currentSets = setsByEntry[entryId] || [];
        const updatedSets = currentSets.map(s => s.id === setId ? { ...s, isDone: false } : s);

        set((state) => ({
            setsByEntry: { ...state.setsByEntry, [entryId]: updatedSets },
            lastDoneSet: null
        }));
    },

    removeSet: async (setId, entryId) => {
        await WorkoutRepo.deleteSet(setId);
        set((state) => ({
            setsByEntry: {
                ...state.setsByEntry,
                [entryId]: (state.setsByEntry[entryId] || []).filter(s => s.id !== setId)
            }
        }));
    },

    removeExercise: async (entryId) => {
        await WorkoutRepo.deleteSessionExercise(entryId);
        set((state) => {
            const newSets = { ...state.setsByEntry };
            delete newSets[entryId];
            return {
                entries: state.entries.filter(e => e.id !== entryId),
                setsByEntry: newSets
            };
        });
    },

    loadPreviousSets: async (exerciseId) => {
        const { activeSession, previousSetsByExercise } = get();
        if (!activeSession || previousSetsByExercise[exerciseId]) return;

        const prevSets = await WorkoutRepo.getLastExerciseSets(exerciseId, activeSession.id);
        set(state => ({
            previousSetsByExercise: {
                ...state.previousSetsByExercise,
                [exerciseId]: prevSets
            }
        }));
    }
}));
