import { db } from '../data/db';
import { Exercise, Template, WorkoutSession, WorkoutExerciseEntry, SetEntry, PR } from '../domain/models';

export interface BackupData {
    version: number;
    exercises: Exercise[];
    templates: Template[];
    workoutSessions: WorkoutSession[];
    workoutExerciseEntries: WorkoutExerciseEntry[];
    setEntries: SetEntry[];
    prs: PR[];
}

export async function exportData(): Promise<string> {
    const data: BackupData = {
        version: 2,
        exercises: await db.exercises.toArray(),
        templates: await db.templates.toArray(),
        workoutSessions: await db.workoutSessions.toArray(),
        workoutExerciseEntries: await db.workoutExerciseEntries.toArray(),
        setEntries: await db.setEntries.toArray(),
        prs: await db.prs.toArray(),
    };
    return JSON.stringify(data);
}

export function validateBackupSchema(data: any): data is BackupData {
    if (typeof data !== 'object' || data === null) return false;

    if (!Array.isArray(data.exercises)) return false;
    if (!Array.isArray(data.templates)) return false;
    if (!Array.isArray(data.workoutSessions)) return false;
    if (!Array.isArray(data.setEntries)) return false;

    return true;
}

export async function importData(json: string): Promise<void> {
    const data = JSON.parse(json);

    if (!validateBackupSchema(data)) {
        throw new Error("Invalid backup format");
    }

    // Use Dexie transaction to ensure atomic rollback if anything fails
    await db.transaction('rw', [db.exercises, db.templates, db.workoutSessions, db.workoutExerciseEntries, db.setEntries, db.prs], async () => {
        // We use bulkPut to intentionally overwrite existing IDs with the backup's data.
        // This allows updates without duplicating IDs.
        if (data.exercises.length) await db.exercises.bulkPut(data.exercises);
        if (data.templates.length) await db.templates.bulkPut(data.templates);
        if (data.workoutSessions.length) await db.workoutSessions.bulkPut(data.workoutSessions);
        if (data.workoutExerciseEntries?.length) await db.workoutExerciseEntries.bulkPut(data.workoutExerciseEntries);
        if (data.setEntries.length) await db.setEntries.bulkPut(data.setEntries);
        if (data.prs?.length) await db.prs.bulkPut(data.prs);
    });
}
