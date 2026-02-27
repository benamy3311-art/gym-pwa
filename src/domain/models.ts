export interface Exercise {
    id: string;
    name: string;
    bodyPart?: string;
    imageType?: 'preset' | 'custom';
    imageKey?: string;
    imageMediaId?: string;
}

export interface Media {
    id: string;
    type: 'exercise';
    mime: string;
    blob: Blob;
    createdAt: number;
}

export interface Template {
    id: string;
    name: string;
    exerciseIds: string[];
    createdAt: number;
    updatedAt: number;
}

export interface WorkoutSession {
    id: string;
    templateId?: string;
    name: string;
    startedAt: number;
    endedAt?: number;
    unit: 'kg' | 'lb';
}

export interface WorkoutExerciseEntry {
    id: string;
    sessionId: string;
    exerciseId: string;
    order: number;
}

export interface SetEntry {
    id: string;
    entryId: string; // Refers to WorkoutExerciseEntry
    setNumber: number;
    weight: number;
    reps: number;
    isDone: boolean;
    createdAt: number;
}

export interface PR {
    id?: string;
    exerciseId: string;
    type: 'max_volume_set' | 'max_weight' | 'max_reps_at_weight';
    value: number; // The weight or the volume
    occurredAt: number;
    sessionId: string;
}
