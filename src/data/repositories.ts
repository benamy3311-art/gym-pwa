import { db } from './db';
import { Exercise, Template, WorkoutSession, WorkoutExerciseEntry, SetEntry, PR } from '../domain/models';

const generateId = () => crypto.randomUUID();

export const ExerciseRepo = {
    async getAll() {
        return await db.exercises.toArray();
    },
    async get(id: string) {
        return await db.exercises.get(id);
    },
    async add(name: string, bodyPart?: string) {
        const exercise: Exercise = { id: generateId(), name, bodyPart };
        await db.exercises.add(exercise);
        return exercise;
    },
    async update(id: string, updates: Partial<Exercise>) {
        await db.exercises.update(id, updates);
    },
    async delete(id: string) {
        await db.exercises.delete(id);
    }
};

export const TemplateRepo = {
    async getAll() {
        return await db.templates.toArray();
    },
    async get(id: string) {
        return await db.templates.get(id);
    },
    async add(name: string, exerciseIds: string[]) {
        const template: Template = { id: generateId(), name, exerciseIds };
        await db.templates.add(template);
        return template;
    },
    async update(id: string, updates: Partial<Template>) {
        await db.templates.update(id, updates);
    },
    async delete(id: string) {
        await db.templates.delete(id);
    }
};

export const WorkoutRepo = {
    async startSession(name: string, templateId?: string, unit: 'kg' | 'lb' = 'kg') {
        const session: WorkoutSession = {
            id: generateId(),
            name,
            templateId,
            startedAt: Date.now(),
            unit
        };
        await db.workoutSessions.add(session);
        return session;
    },
    async finishSession(sessionId: string) {
        await db.workoutSessions.update(sessionId, { endedAt: Date.now() });
    },
    async getAllSessions() {
        return await db.workoutSessions.orderBy('startedAt').reverse().toArray();
    },
    async getSession(id: string) {
        return await db.workoutSessions.get(id);
    },
    async deleteSession(id: string) {
        // Cascade delete sets and entries
        const entries = await db.workoutExerciseEntries.where('sessionId').equals(id).toArray();
        for (const entry of entries) {
            await db.setEntries.where('entryId').equals(entry.id).delete();
        }
        await db.workoutExerciseEntries.where('sessionId').equals(id).delete();
        await db.workoutSessions.delete(id);
    },

    async addExerciseToSession(sessionId: string, exerciseId: string, order: number) {
        const entry: WorkoutExerciseEntry = { id: generateId(), sessionId, exerciseId, order };
        await db.workoutExerciseEntries.add(entry);
        return entry;
    },
    async getSessionExercises(sessionId: string) {
        return await db.workoutExerciseEntries.where('sessionId').equals(sessionId).sortBy('order');
    },
    async deleteSessionExercise(entryId: string) {
        await db.setEntries.where('entryId').equals(entryId).delete();
        await db.workoutExerciseEntries.delete(entryId);
    },

    async addSet(entryId: string, setNumber: number, weight: number, reps: number) {
        const setEntry: SetEntry = {
            id: generateId(),
            entryId,
            setNumber,
            weight,
            reps,
            isDone: false,
            createdAt: Date.now()
        };
        await db.setEntries.add(setEntry);
        return setEntry;
    },
    async updateSet(id: string, updates: Partial<SetEntry>) {
        await db.setEntries.update(id, updates);
    },
    async deleteSet(id: string) {
        await db.setEntries.delete(id);
    },
    async getSetsForEntry(entryId: string) {
        return await db.setEntries.where('entryId').equals(entryId).sortBy('setNumber');
    },

    /**
     * Complex query to get history of a specific exercise
     */
    async getExerciseHistory(exerciseId: string) {
        // Find all entries for this exercise
        const entries = await db.workoutExerciseEntries.where('exerciseId').equals(exerciseId).toArray();
        const entryIds = entries.map(e => e.id);
        // Find all sets for these entries
        const sets = await db.setEntries.where('entryId').anyOf(entryIds).toArray();
        return { entries, sets };
    },

    async getLastExerciseSets(exerciseId: string, currentSessionId: string): Promise<SetEntry[]> {
        const entries = await db.workoutExerciseEntries.where('exerciseId').equals(exerciseId).toArray();
        const pastEntries = entries.filter(e => e.sessionId !== currentSessionId);
        if (pastEntries.length === 0) return [];

        const sessionIds = pastEntries.map(e => e.sessionId);
        const sessions = await db.workoutSessions.where('id').anyOf(sessionIds).toArray();

        sessions.sort((a, b) => b.startedAt - a.startedAt);
        const lastSession = sessions.find(s => s.endedAt !== undefined);

        if (!lastSession) return [];

        const lastEntry = pastEntries.find(e => e.sessionId === lastSession.id);
        if (!lastEntry) return [];

        return await db.setEntries.where('entryId').equals(lastEntry.id).sortBy('setNumber');
    }
};

export const PRRepo = {
    async getPRsForExercise(exerciseId: string) {
        return await db.prs.where('exerciseId').equals(exerciseId).toArray();
    },
    async savePRs(prs: PR[]) {
        await db.prs.bulkAdd(prs);
    },
    async countPRsForSession(sessionId: string) {
        return await db.prs.where('sessionId').equals(sessionId).count();
    }
};
