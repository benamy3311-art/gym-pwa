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

export interface HomeStats {
    /** Consecutive calendar days (ending today or yesterday) with >= 1 completed session. */
    streakDays: number;
    /** Total volume (weight * reps of done sets) across completed sessions in the last 7 days. */
    weeklyVolume: number;
}

/** Local-timezone calendar-day key for a timestamp. */
function dayKey(timestamp: number): string {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function computeHomeStats(
    sessions: WorkoutSession[],
    entries: WorkoutExerciseEntry[],
    sets: SetEntry[],
    now: number = Date.now()
): HomeStats {
    // --- Streak: consecutive calendar days with at least one completed session,
    // walking backward from today (or yesterday, if today has no workout yet).
    const trainedDays = new Set<string>();
    for (const s of sessions) {
        if (s.endedAt) trainedDays.add(dayKey(s.startedAt));
    }

    const DAY_MS = 24 * 60 * 60 * 1000;
    let streakDays = 0;
    let cursor = now;
    // A streak isn't broken by "today hasn't happened yet".
    if (!trainedDays.has(dayKey(cursor))) cursor -= DAY_MS;
    while (trainedDays.has(dayKey(cursor))) {
        streakDays++;
        cursor -= DAY_MS;
    }

    // --- Weekly volume: same window/filters as computeWeeklySummary.
    const oneWeekAgo = now - 7 * DAY_MS;
    const recentSessionIds = new Set(
        sessions.filter(s => s.endedAt && s.endedAt >= oneWeekAgo).map(s => s.id)
    );
    const recentEntryIds = new Set(
        entries.filter(e => recentSessionIds.has(e.sessionId)).map(e => e.id)
    );

    let weeklyVolume = 0;
    for (const set of sets) {
        if (set.isDone && recentEntryIds.has(set.entryId)) {
            weeklyVolume += set.weight * set.reps;
        }
    }

    return { streakDays, weeklyVolume };
}
