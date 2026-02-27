import { useEffect, useState } from 'react';
import { Exercise } from '../domain/models';
import { MediaRepo } from '../data/mediaRepository';
import { Dumbbell } from 'lucide-react';
import { cn } from './GlassCard';

interface Props {
    exercise: Exercise;
    className?: string;
}

export function ExerciseImage({ exercise, className }: Props) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;

        async function load() {
            if (exercise.imageType === 'custom' && exercise.imageMediaId) {
                try {
                    const blob = await MediaRepo.getImage(exercise.imageMediaId);
                    if (blob) {
                        objectUrl = URL.createObjectURL(blob);
                        setUrl(objectUrl);
                    }
                } catch (e) {
                    console.error("Failed to load image");
                }
            } else if (exercise.imageType === 'preset' && exercise.imageKey) {
                setUrl(`/assets/${exercise.imageKey}`);
            }
        }

        load();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [exercise]);

    // Fallback
    if (!url) {
        return (
            <div className={cn('flex items-center justify-center bg-white/10 shrink-0', className)}>
                <Dumbbell className="text-white/50 w-1/2 h-1/2" />
            </div>
        );
    }

    return (
        <img src={url} alt={exercise.name} className={cn('object-cover shrink-0', className)} />
    );
}
