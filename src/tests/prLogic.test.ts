import { describe, it, expect } from 'vitest';
import { calculateSetVolume, calculateTotalVolume, determineNewPRs } from '../domain/prLogic';
import { SetEntry, PR } from '../domain/models';

describe('PR Logic', () => {
    it('calculates set volume correctly', () => {
        const set: SetEntry = {
            id: '1', entryId: '1', setNumber: 1, weight: 100, reps: 5, isDone: true, createdAt: 0
        };
        expect(calculateSetVolume(set)).toBe(500);
    });

    it('calculates total volume of finished sets', () => {
        const sets: SetEntry[] = [
            { id: '1', entryId: '1', setNumber: 1, weight: 100, reps: 5, isDone: true, createdAt: 0 },
            { id: '2', entryId: '1', setNumber: 2, weight: 100, reps: 5, isDone: false, createdAt: 0 },
            { id: '3', entryId: '1', setNumber: 3, weight: 80, reps: 10, isDone: true, createdAt: 0 },
        ];
        // 500 + 800 = 1300. Set 2 is ignored.
        expect(calculateTotalVolume(sets)).toBe(1300);
    });

    it('determines both max_weight and max_volume_set PRs for a breakthrough set', () => {
        const existingPRs: PR[] = [
            { exerciseId: 'ex1', type: 'max_weight', value: 100, occurredAt: 0, sessionId: 's1' },
            { exerciseId: 'ex1', type: 'max_volume_set', value: 500, occurredAt: 0, sessionId: 's1' },
        ];

        // New set: 110x5 = 550 volume. Beats both max_weight (100) and max_volume_set (500)
        const newSet: SetEntry = {
            id: 'ns1', entryId: '1', setNumber: 1, weight: 110, reps: 5, isDone: true, createdAt: 1000
        };

        const newPRs = determineNewPRs('ex1', newSet, existingPRs, 's2');

        expect(newPRs.length).toBe(2);
        expect(newPRs.find(p => p.type === 'max_weight')?.value).toBe(110);
        expect(newPRs.find(p => p.type === 'max_volume_set')?.value).toBe(550);
    });

    it('does not generate PRs if set is not marked done', () => {
        const existingPRs: PR[] = [];
        const newSet: SetEntry = {
            id: 'ns1', entryId: '1', setNumber: 1, weight: 1000, reps: 10, isDone: false, createdAt: 1000
        };
        const newPRs = determineNewPRs('ex1', newSet, existingPRs, 's2');
        expect(newPRs.length).toBe(0);
    });
});
