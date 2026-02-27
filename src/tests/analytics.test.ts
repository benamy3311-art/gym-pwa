import { describe, it, expect } from 'vitest';
import { computeWeeklySummary, computeExerciseProgress } from '../domain/analytics';
import { WorkoutSession, WorkoutExerciseEntry, SetEntry, PR } from '../domain/models';

describe('Analytics Domain Calculations', () => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    const mockSessions: WorkoutSession[] = [
        { id: 's1', templateId: 't1', name: 'Mock 1', unit: 'kg', startedAt: now - weekMs * 2, endedAt: now - weekMs * 2 + 1000 },
        { id: 's2', templateId: 't1', name: 'Mock 2', unit: 'kg', startedAt: now - 1000, endedAt: now }
    ];

    const mockEntries: WorkoutExerciseEntry[] = [
        { id: 'e1', sessionId: 's1', exerciseId: 'ex1', order: 0 },
        { id: 'e2', sessionId: 's2', exerciseId: 'ex1', order: 0 }
    ];

    const mockSets: SetEntry[] = [
        { id: 'set1', entryId: 'e1', setNumber: 1, weight: 100, reps: 5, isDone: true, createdAt: now },
        { id: 'set2', entryId: 'e2', setNumber: 1, weight: 110, reps: 5, isDone: true, createdAt: now }
    ];

    const mockPRs: PR[] = [
        { id: 'pr1', exerciseId: 'ex1', type: 'max_weight', value: 110, occurredAt: now, sessionId: 's2' }
    ];

    it('should compute exercise progress correctly over time', () => {
        const progress = computeExerciseProgress(mockSessions, mockEntries, mockSets, 'ex1');
        expect(progress.length).toBe(2);

        // First session
        expect(progress[0].maxWeight).toBe(100);
        expect(progress[0].totalVolume).toBe(500);

        // Second session
        expect(progress[1].maxWeight).toBe(110);
        expect(progress[1].totalVolume).toBe(550);
    });

    it('should compute weekly summary considering only the last 7 days', () => {
        const summary = computeWeeklySummary(mockSessions, mockEntries, mockSets, mockPRs);

        expect(summary.totalSessions).toBe(1); // Only s2 is recent
        expect(summary.totalVolume).toBe(550); // Only sets from s2
        expect(summary.totalPRs).toBe(1); // Only pr1 is recent
    });
});
