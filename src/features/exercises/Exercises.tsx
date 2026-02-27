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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="flex flex-col gap-3 mb-1 mt-4 px-1">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="ios-title mb-1">Exercises</h1>
                        <p className="ios-body text-[color:var(--text-secondary)]">Manage your library</p>
                    </div>
                    <GlassButton variant="primary" size="sm" onClick={handleCreate} className="rounded-full w-10 h-10 p-0 mb-1">
                        <Plus size={20} />
                    </GlassButton>
                </div>
                <div className="relative mt-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                    <GlassInput
                        type="text"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </header>

            <div className="flex flex-col gap-3 px-1">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {filtered.map(ex => (
                    <GlassCard key={ex.id} variant="elevated" className="flex items-center gap-4 py-3 px-4 group tap-highlight hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="relative shrink-0">
                            <ExerciseImage exercise={ex} className="w-[52px] h-[52px] rounded-xl shadow-sm" />
                            <button
                                onClick={(e) => { e.stopPropagation(); uploadClick(ex); }}
                                className="absolute -bottom-1 -right-1 bg-accent rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_4px_10px_rgba(10,132,255,0.4)] text-[#ffffff] tap-highlight"
                            >
                                <ImagePlus size={14} />
                            </button>
                        </div>
                        <div className="flex-1">
                            <p className="ios-body font-semibold">{ex.name}</p>
                            {ex.bodyPart && <p className="ios-subhead text-[color:var(--text-secondary)] mt-0.5">{ex.bodyPart}</p>}
                        </div>
                    </GlassCard>
                ))}

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-glass-inset rounded-3xl border border-glass-border/30 mt-2">
                        <Dumbbell size={48} className="text-tertiary mb-4 opacity-50" />
                        <p className="font-medium text-primary text-lg tracking-tight">No exercises found.</p>
                        <p className="text-[15px] text-secondary mt-1 max-w-[200px]">Try adjusting your search or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
