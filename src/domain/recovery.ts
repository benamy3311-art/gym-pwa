import { WorkoutSession, WorkoutExerciseEntry, Exercise } from './models';

/**
 * The real muscle-group body parts tracked on the recovery map.
 * Cardio is intentionally excluded — it isn't a muscle group.
 * Keys are lowercase to make lookups case-insensitive.
 */
export const MUSCLE_BODY_PARTS = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'legs',
    'core'
] as const;

export type MuscleBodyPart = typeof MUSCLE_BODY_PARTS[number];

/** Days since each body part was last trained, or null if never trained. */
export type BodyPartRecency = Record<MuscleBodyPart, number | null>;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure function: for each muscle-group body part, find the most recent
 * COMPLETED session (endedAt set) containing an exercise with that bodyPart
 * and return whole days elapsed since then (0 = today), or null if the
 * body part has never been trained.
 */
export function computeBodyPartRecency(
    sessions: WorkoutSession[],
    entries: WorkoutExerciseEntry[],
    exercises: Exercise[],
    now: number = Date.now()
): BodyPartRecency {
    const recency = Object.fromEntries(
        MUSCLE_BODY_PARTS.map(part => [part, null])
    ) as BodyPartRecency;

    const bodyPartByExerciseId = new Map<string, string>();
    for (const ex of exercises) {
        if (ex.bodyPart) bodyPartByExerciseId.set(ex.id, ex.bodyPart.toLowerCase().trim());
    }

    const completedSessionEnds = new Map<string, number>();
    for (const s of sessions) {
        if (s.endedAt) completedSessionEnds.set(s.id, s.endedAt);
    }

    // Track the most recent endedAt per body part.
    const lastTrainedAt = new Map<MuscleBodyPart, number>();
    for (const entry of entries) {
        const endedAt = completedSessionEnds.get(entry.sessionId);
        if (endedAt === undefined) continue;

        const bodyPart = bodyPartByExerciseId.get(entry.exerciseId) as MuscleBodyPart | undefined;
        if (!bodyPart || !(MUSCLE_BODY_PARTS as readonly string[]).includes(bodyPart)) continue;

        const prev = lastTrainedAt.get(bodyPart);
        if (prev === undefined || endedAt > prev) lastTrainedAt.set(bodyPart, endedAt);
    }

    for (const [part, endedAt] of lastTrainedAt) {
        recency[part] = Math.max(0, Math.floor((now - endedAt) / DAY_MS));
    }

    return recency;
}
