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
        }).upgrade(_tx => {
            // In Dexie, structural changes to existing records are usually not strictly required
            // unless we want to initialize new fields. We'll leave `imageType` etc. optional
            // so we don't need a heavy data migration map here, they'll just resolve to undefined.
        });

        this.on('populate', async () => {
            await seedDefaultExercises();
        });
    }
}

export const db = new GymDatabase();

export async function seedDefaultExercises() {
    const initialExercises: Exercise[] = [
        // CHEST
        { id: crypto.randomUUID(), name: 'Barbell Bench Press', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Incline Barbell Bench Press', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Decline Barbell Bench Press', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Dumbbell Bench Press', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Incline Dumbbell Press', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Chest Fly (Dumbbell)', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Cable Fly', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Pec Deck Machine', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Push-Up', bodyPart: 'Chest', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Dips (Chest)', bodyPart: 'Chest', imageType: 'preset' },

        // BACK
        { id: crypto.randomUUID(), name: 'Pull-Up', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Chin-Up', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Lat Pulldown', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Seated Cable Row', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Barbell Row', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Dumbbell Row', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'T-Bar Row', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Machine Row', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Face Pull', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Straight Arm Pulldown', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Deadlift', bodyPart: 'Back', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Romanian Deadlift', bodyPart: 'Back', imageType: 'preset' },

        // SHOULDERS
        { id: crypto.randomUUID(), name: 'Barbell Overhead Press', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Dumbbell Shoulder Press', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Arnold Press', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Lateral Raise (Dumbbell)', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Lateral Raise (Cable)', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Front Raise', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Rear Delt Fly', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Upright Row', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Shrugs (Dumbbell)', bodyPart: 'Shoulders', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Shrugs (Barbell)', bodyPart: 'Shoulders', imageType: 'preset' },

        // BICEPS
        { id: crypto.randomUUID(), name: 'Barbell Curl', bodyPart: 'Biceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Dumbbell Curl', bodyPart: 'Biceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Hammer Curl', bodyPart: 'Biceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Preacher Curl', bodyPart: 'Biceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Cable Curl', bodyPart: 'Biceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Concentration Curl', bodyPart: 'Biceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'EZ Bar Curl', bodyPart: 'Biceps', imageType: 'preset' },

        // TRICEPS
        { id: crypto.randomUUID(), name: 'Triceps Pushdown', bodyPart: 'Triceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Overhead Triceps Extension', bodyPart: 'Triceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Skull Crushers', bodyPart: 'Triceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Close Grip Bench Press', bodyPart: 'Triceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Dips (Triceps)', bodyPart: 'Triceps', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Cable Overhead Extension', bodyPart: 'Triceps', imageType: 'preset' },

        // LEGS
        { id: crypto.randomUUID(), name: 'Barbell Squat', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Front Squat', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Hack Squat', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Leg Press', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Bulgarian Split Squat', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Lunges', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Leg Extension', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Lying Leg Curl', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Seated Leg Curl', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Calf Raise (Standing)', bodyPart: 'Legs', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Calf Raise (Seated)', bodyPart: 'Legs', imageType: 'preset' },

        // CORE
        { id: crypto.randomUUID(), name: 'Plank', bodyPart: 'Core', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Hanging Leg Raise', bodyPart: 'Core', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Cable Crunch', bodyPart: 'Core', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Ab Wheel', bodyPart: 'Core', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Russian Twist', bodyPart: 'Core', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Decline Sit-Up', bodyPart: 'Core', imageType: 'preset' },

        // CARDIO
        { id: crypto.randomUUID(), name: 'Treadmill Run', bodyPart: 'Cardio', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Treadmill Walk', bodyPart: 'Cardio', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Cycling', bodyPart: 'Cardio', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Rowing Machine', bodyPart: 'Cardio', imageType: 'preset' },
        { id: crypto.randomUUID(), name: 'Stair Climber', bodyPart: 'Cardio', imageType: 'preset' },
    ];

    // Check if db already has some of these to avoid full duplicates if called manually
    const existing = await db.exercises.toArray();
    const existingNames = new Set(existing.map((e: Exercise) => e.name.toLowerCase()));

    const toInsert = initialExercises.filter(ex => !existingNames.has(ex.name.toLowerCase()));
    if (toInsert.length > 0) {
        await db.exercises.bulkAdd(toInsert);
    }
}
