import { WorkoutSession, SetEntry, PR, WorkoutExerciseEntry } from './models';

export interface ExerciseProgressData {
    date: string;
    maxWeight: number;
    totalVolume: number;
}

export interface WeeklySummary {
    totalSessions: number;
    totalVolume: number;
    totalPRs: number;
}

export function computeExerciseProgress(
    sessions: WorkoutSession[],
    entries: WorkoutExerciseEntry[],
    sets: SetEntry[],
    exerciseId: string
): ExerciseProgressData[] {
    const sessionMap = new Map(sessions.map(s => [s.id, s]));
    const exerciseEntries = entries.filter(e => e.exerciseId === exerciseId);
    const entryIds = new Set(exerciseEntries.map(e => e.id));

    const sessionData = new Map<string, { date: number, maxWeight: number, volume: number }>();

    for (const set of sets) {
        if (!set.isDone || !entryIds.has(set.entryId)) continue;

        // Find the entry to get the session
        const entry = exerciseEntries.find(e => e.id === set.entryId);
        if (!entry) continue;

        const session = sessionMap.get(entry.sessionId);
        if (!session || !session.endedAt) continue;

        const sessionId = session.id;
        if (!sessionData.has(sessionId)) {
            sessionData.set(sessionId, { date: session.endedAt, maxWeight: 0, volume: 0 });
        }
        const data = sessionData.get(sessionId)!;

        if (set.weight > data.maxWeight) data.maxWeight = set.weight;
        data.volume += set.weight * set.reps;
    }

    return Array.from(sessionData.values())
        .sort((a, b) => a.date - b.date)
        .map(data => ({
            date: new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            maxWeight: data.maxWeight,
            totalVolume: data.volume
        }));
}

export function computeWeeklySummary(
    sessions: WorkoutSession[],
    entries: WorkoutExerciseEntry[],
    sets: SetEntry[],
    prs: PR[]
): WeeklySummary {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recentSessions = sessions.filter(s => s.endedAt && s.endedAt >= oneWeekAgo);
    const recentSessionIds = new Set(recentSessions.map(s => s.id));

    const recentEntriesIds = new Set(
        entries.filter(e => recentSessionIds.has(e.sessionId)).map(e => e.id)
    );

    let totalVolume = 0;
    for (const set of sets) {
        if (set.isDone && recentEntriesIds.has(set.entryId)) {
            totalVolume += set.weight * set.reps;
        }
    }

    const recentPRs = prs.filter(pr => pr.occurredAt >= oneWeekAgo);

    return {
        totalSessions: recentSessions.length,
        totalVolume,
        totalPRs: recentPRs.length
    };
}
