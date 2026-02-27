import { db } from '../../data/db';
import { TemplateRepo, WorkoutRepo } from '../../data/repositories';
import { WorkoutExerciseEntry, SetEntry } from '../../domain/models';

const generateId = () => crypto.randomUUID();

/**
 * Robustly starts a workout from a template, ensuring all exercises and initial sets are created.
 */
export async function startWorkoutFromTemplate(templateId: string): Promise<string> {
    const template = await TemplateRepo.get(templateId);
    if (!template) throw new Error("Routine not found");

    if (template.exerciseIds.length === 0) {
        throw new Error("Routine has no exercises configured");
    }

    // Start a transaction to ensure atomicity
    return await db.transaction('rw', [db.workoutSessions, db.workoutExerciseEntries, db.setEntries, db.exercises], async () => {
        // 1. Create the session
        const session = await WorkoutRepo.startSession(template.name, template.id);

        // 2. Create entries for each exercise
        const entries: WorkoutExerciseEntry[] = [];
        const exercisesInDb = await db.exercises.where('id').anyOf(template.exerciseIds).toArray();
        const existingIds = new Set(exercisesInDb.map(ex => ex.id));

        const validIds = template.exerciseIds.filter(id => {
            if (!existingIds.has(id)) {
                console.warn(`Exercise ${id} not found in DB, skipping from session.`);
                return false;
            }
            return true;
        });

        if (validIds.length === 0) {
            throw new Error("None of the exercises in this routine exist in the database anymore.");
        }

        for (let i = 0; i < validIds.length; i++) {
            const exerciseId = validIds[i];
            const entry: WorkoutExerciseEntry = {
                id: generateId(),
                sessionId: session.id,
                exerciseId,
                order: i
            };
            entries.push(entry);
        }

        await db.workoutExerciseEntries.bulkAdd(entries);

        // 3. Create initial empty set for each entry to follow current app logic
        const initialSets: SetEntry[] = entries.map(entry => ({
            id: generateId(),
            entryId: entry.id,
            setNumber: 1,
            weight: 0,
            reps: 0,
            isDone: false,
            createdAt: Date.now()
        }));

        await db.setEntries.bulkAdd(initialSets);

        return session.id;
    });
}
