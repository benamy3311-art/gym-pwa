import Dexie, { type Table } from 'dexie';
import {
    Exercise,
    Template,
    WorkoutSession,
    WorkoutExerciseEntry,
    SetEntry,
    PR,
    Media
} from '../domain/models';

export class GymDatabase extends Dexie {
    exercises!: Table<Exercise, string>;
    templates!: Table<Template, string>;
    workoutSessions!: Table<WorkoutSession, string>;
    workoutExerciseEntries!: Table<WorkoutExerciseEntry, string>;
    setEntries!: Table<SetEntry, string>;
    prs!: Table<PR, string>;
    media!: Table<Media, string>;

    constructor() {
        super('GymPWA_DB');

        // v1 Schema
        this.version(1).stores({
            exercises: 'id, name, bodyPart',
            templates: 'id, name',
            workoutSessions: 'id, templateId, startedAt, endedAt',
            workoutExerciseEntries: 'id, sessionId, exerciseId, order',
            setEntries: 'id, entryId, isDone',
            prs: '++id, exerciseId, type, sessionId'
        });

        // v2 Schema - Add media table and indices
        this.version(2).stores({
            media: 'id, type, createdAt'
        }).upgrade(tx => {
            // In Dexie, structural changes to existing records are usually not strictly required
            // unless we want to initialize new fields. We'll leave `imageType` etc. optional
            // so we don't need a heavy data migration map here, they'll just resolve to undefined.
        });
    }
}

export const db = new GymDatabase();
