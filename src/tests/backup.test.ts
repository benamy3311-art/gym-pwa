import { describe, it, expect } from 'vitest';
import { validateBackupSchema } from '../utils/backup';

describe('Data Backup Validation', () => {
    it('should invalidate incorrect schemas', () => {
        const invalid1 = { exercises: [] };
        const invalid2 = null;
        const invalid3 = {};

        expect(validateBackupSchema(invalid1)).toBe(false);
        expect(validateBackupSchema(invalid2)).toBe(false);
        expect(validateBackupSchema(invalid3)).toBe(false);
    });

    it('should validate a correct partial schema', () => {
        const valid: any = {
            version: 2,
            exercises: [],
            templates: [],
            workoutSessions: [],
            workoutExerciseEntries: [],
            setEntries: [],
            prs: []
        };

        expect(validateBackupSchema(valid)).toBe(true);
    });
});
