import { SetEntry, PR } from './models';

/**
 * Calculates the volume of a single set.
 */
export function calculateSetVolume(set: SetEntry): number {
    return set.weight * set.reps;
}

/**
 * Calculates the total volume of an array of completed sets.
 */
export function calculateTotalVolume(sets: SetEntry[]): number {
    return sets.filter(s => s.isDone).reduce((total, s) => total + calculateSetVolume(s), 0);
}

/**
 * Checks if a newly completed set is a PR.
 * Returns the new PR object if it is, otherwise null.
 */
export function determineNewPRs(
    exerciseId: string,
    newSet: SetEntry,
    existingPRs: PR[],
    sessionId: string
): PR[] {
    if (!newSet.isDone) return [];

    const newPRs: PR[] = [];

    // 1. Check max_weight
    const maxWeightPR = existingPRs.find(pr => pr.type === 'max_weight');
    if (!maxWeightPR || newSet.weight > maxWeightPR.value) {
        newPRs.push({
            exerciseId,
            type: 'max_weight',
            value: newSet.weight,
            occurredAt: newSet.createdAt,
            sessionId
        });
    }

    // 2. Check max_volume_set
    const setVolume = calculateSetVolume(newSet);
    const maxVolumeSetPR = existingPRs.find(pr => pr.type === 'max_volume_set');
    if (!maxVolumeSetPR || setVolume > maxVolumeSetPR.value) {
        newPRs.push({
            exerciseId,
            type: 'max_volume_set',
            value: setVolume,
            occurredAt: newSet.createdAt,
            sessionId
        });
    }

    return newPRs;
}
