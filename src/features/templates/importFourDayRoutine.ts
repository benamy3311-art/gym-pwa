import { ExerciseRepo, TemplateRepo } from '../../data/repositories';
import { Exercise, Template } from '../../domain/models';

// Mapeo bruto de la rutina provista
const ROUTINE_DATA = [
    {
        name: 'One',
        exercises: [
            { name: 'Strict Military Press (Barbell)', bodyPart: 'shoulders' },
            { name: 'Incline Row (Dumbbell)', bodyPart: 'back' },
            { name: 'Lateral Raise (Cable)', bodyPart: 'shoulders' },
            { name: 'Incline Bench Press (Dumbbell)', bodyPart: 'chest' },
            { name: 'Shrug (Dumbbell)', bodyPart: 'shoulders' },
            { name: 'Lat Pulldown (Cable)', bodyPart: 'back' },
            { name: 'Triceps Extension (Cable)', bodyPart: 'triceps' },
        ]
    },
    {
        name: 'Two',
        exercises: [
            { name: 'Romanian Deadlift (Barbell)', bodyPart: 'legs' },
            { name: 'Calf Press on Leg Press', bodyPart: 'legs' },
            { name: 'Seated Leg Curl (Machine)', bodyPart: 'legs' },
            { name: 'Leg Extension (Machine)', bodyPart: 'legs' },
            { name: 'Back Extension', bodyPart: 'core' },
        ]
    },
    {
        name: 'Three',
        exercises: [
            { name: 'Bench Press (Barbell)', bodyPart: 'chest' },
            { name: 'Bent Over One Arm Row (Dumbbell)', bodyPart: 'back' },
            { name: 'Bicep Curl (Barbell)', bodyPart: 'biceps' },
            { name: 'Skullcrusher (Barbell)', bodyPart: 'triceps' },
            { name: 'Lateral Raise (Cable)', bodyPart: 'shoulders' },
            { name: 'Chest Fly', bodyPart: 'chest' },
            { name: 'Hammer Curl (Dumbbell)', bodyPart: 'biceps' },
        ]
    },
    {
        name: 'Four',
        exercises: [
            { name: 'Squat (Barbell)', bodyPart: 'legs' },
            { name: 'Bulgarian Split Squat', bodyPart: 'legs' },
            { name: 'Leg Extension (Machine)', bodyPart: 'legs' },
            { name: 'Lying Leg Curl (Machine)', bodyPart: 'legs' },
            { name: 'Standing Calf Raise (Machine)', bodyPart: 'legs' },
            { name: 'Face Pull (Cable)', bodyPart: 'shoulders' },
        ]
    }
];

export async function importFourDayRoutine(): Promise<{ created: number, updated: number }> {
    let created = 0;
    let updated = 0;

    // 1. Cargar todos los ejercicios existentes para evitar duplicados
    const allExercises: Exercise[] = await ExerciseRepo.getAll();
    const exerciseMap = new Map<string, string>(allExercises.map(ex => [ex.name.toLowerCase().trim(), ex.id]));

    // 2. Cargar todos los templates existentes
    const allTemplates: Template[] = await TemplateRepo.getAll();
    const templateMap = new Map<string, Template>(allTemplates.map(t => [t.name.toLowerCase().trim(), t]));

    for (const routine of ROUTINE_DATA) {
        const exerciseIds: string[] = [];

        // 3. Procesar ejercicios manteniendo el orden
        for (const exData of routine.exercises) {
            const key = exData.name.toLowerCase().trim();
            let exId = exerciseMap.get(key);

            if (!exId) {
                // Si no existe, crearlo
                const newEx = await ExerciseRepo.add(exData.name, exData.bodyPart);
                exId = newEx.id;
                exerciseMap.set(key, exId); // Actualizar mapa para no duplicar si se repite en otro día
            }
            exerciseIds.push(exId);
        }

        // 4. Crear o actualizar el template
        const templateKey = routine.name.toLowerCase().trim();
        const existingTemplate = templateMap.get(templateKey);

        if (existingTemplate) {
            // Actualizar
            await TemplateRepo.update(existingTemplate.id, { exerciseIds });
            updated++;
        } else {
            // Crear
            await TemplateRepo.add(routine.name, exerciseIds);
            created++;
        }
    }

    return { created, updated };
}
