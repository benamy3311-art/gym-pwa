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
        const now = Date.now();
        const template: Template = {
            id: generateId(),
            name,
            exerciseIds,
            createdAt: now,
            updatedAt: now
        };
        await db.templates.add(template);
        return template;
    },
    async update(id: string, updates: Partial<Template>) {
        updates.updatedAt = Date.now();
        await db.templates.update(id, updates);
    },
    async delete(id: string) {
        await db.templates.delete(id);
    },
    async addExercise(templateId: string, exerciseId: string) {
        const t = await this.get(templateId);
        if (!t) throw new Error("Template not found");
        // Pure function approach for immutable array
        if (!t.exerciseIds.includes(exerciseId)) {
            const newExerciseIds = [...t.exerciseIds, exerciseId];
            await this.update(templateId, { exerciseIds: newExerciseIds });
            return newExerciseIds;
        }
        return t.exerciseIds;
    },
    async removeExercise(templateId: string, exerciseId: string) {
        const t = await this.get(templateId);
        if (!t) throw new Error("Template not found");
        const newExerciseIds = t.exerciseIds.filter(id => id !== exerciseId);
        await this.update(templateId, { exerciseIds: newExerciseIds });
        return newExerciseIds;
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
        // Match on the exercise NAME, not just its id. The same exercise can exist
        // under several ids (seeded separately across devices/installs), so history
        // must be found regardless of which copy a past session referenced.
        const target = await db.exercises.get(exerciseId);
        const name = target?.name.trim().toLowerCase();
        const exerciseIds = name
            ? (await db.exercises.filter(e => e.name.trim().toLowerCase() === name).toArray()).map(e => e.id)
            : [exerciseId];
        if (!exerciseIds.includes(exerciseId)) exerciseIds.push(exerciseId);

        const entries = await db.workoutExerciseEntries.where('exerciseId').anyOf(exerciseIds).toArray();
        const pastEntries = entries.filter(e => e.sessionId !== currentSessionId);
        if (pastEntries.length === 0) return [];

        // First past entry per session (an exercise usually appears once per session).
        const entryBySession = new Map<string, WorkoutExerciseEntry>();
        for (const e of pastEntries) {
            if (!entryBySession.has(e.sessionId)) entryBySession.set(e.sessionId, e);
        }

        const sessions = await db.workoutSessions.where('id').anyOf([...entryBySession.keys()]).toArray();
        const finishedNewestFirst = sessions
            .filter(s => s.endedAt !== undefined)
            .sort((a, b) => b.startedAt - a.startedAt);

        // Return the newest finished session that actually recorded something, so an
        // empty/aborted session doesn't shadow the real previous numbers.
        for (const sess of finishedNewestFirst) {
            const entry = entryBySession.get(sess.id);
            if (!entry) continue;
            const setsForEntry = await db.setEntries.where('entryId').equals(entry.id).sortBy('setNumber');
            if (setsForEntry.some(s => (s.weight || 0) > 0 || (s.reps || 0) > 0)) {
                return setsForEntry;
            }
        }
        return [];
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
