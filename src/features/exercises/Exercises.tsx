import { useEffect, useState, useRef } from 'react';
import { ExerciseRepo } from '../../data/repositories';
import { MediaRepo } from '../../data/mediaRepository';
import { Exercise } from '../../domain/models';
import { compressImage } from '../../utils/imageCompressor';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { GlassInput } from '../../ui/GlassInput';
import { ExerciseImage } from '../../ui/ExerciseImage';
import { Search, Plus, Dumbbell, ImagePlus } from 'lucide-react';

export default function Exercises() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [search, setSearch] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingEx, setEditingEx] = useState<Exercise | null>(null);

    useEffect(() => {
        ExerciseRepo.getAll().then(setExercises);
    }, []);

    const handleCreate = async () => {
        const name = prompt('Exercise Name:');
        if (name) {
            const ex = await ExerciseRepo.add(name, 'Other');
            setExercises([...exercises, ex].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingEx) return;

        try {
            const compressed = await compressImage(file, 512, 512, 0.8);
            const mediaId = crypto.randomUUID();
            await MediaRepo.saveImage(mediaId, compressed, 'image/webp');

            if (editingEx.imageType === 'custom' && editingEx.imageMediaId) {
                await MediaRepo.deleteImage(editingEx.imageMediaId);
            }

            await ExerciseRepo.update(editingEx.id, {
                imageType: 'custom',
                imageMediaId: mediaId
            });

            const latest = await ExerciseRepo.getAll();
            setExercises(latest);
        } catch (err) {
            alert("Error saving image.");
        } finally {
            setEditingEx(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const uploadClick = (ex: Exercise) => {
        setEditingEx(ex);
        fileInputRef.current?.click();
    };

    const filtered = exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col gap-4 mb-2 mt-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
                    <GlassButton variant="primary" onClick={handleCreate}>
                        <Plus size={20} />
                    </GlassButton>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <GlassInput
                        type="text"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12 rounded-xl"
                    />
                </div>
            </header>

            <div className="flex flex-col gap-3 pb-8">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {filtered.map(ex => (
                    <GlassCard key={ex.id} className="flex items-center gap-4 py-3 group">
                        <div className="relative shrink-0">
                            <ExerciseImage exercise={ex} className="w-12 h-12 rounded-xl" />
                            <button
                                onClick={(e) => { e.stopPropagation(); uploadClick(ex); }}
                                className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-white"
                            >
                                <ImagePlus size={12} />
                            </button>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-lg">{ex.name}</p>
                            {ex.bodyPart && <p className="text-xs text-white/50">{ex.bodyPart}</p>}
                        </div>
                    </GlassCard>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-10 glass-panel rounded-2xl border-dashed">
                        <Dumbbell size={40} className="mx-auto text-white/20 mb-3" />
                        <p className="text-white/50">No exercises found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
