import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplates } from './useTemplates';
import { ExerciseRepo } from '../../data/repositories';
import { Exercise } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { GlassInput } from '../../ui/GlassInput';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import { ExerciseImage } from '../../ui/ExerciseImage';

export function TemplateEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { templates, loadTemplates, addExercise, removeExercise } = useTemplates();
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const template = templates.find(t => t.id === id);

    useEffect(() => {
        if (templates.length === 0) {
            loadTemplates();
        }
        ExerciseRepo.getAll().then(setAllExercises);
    }, [templates.length, loadTemplates]);

    useEffect(() => {
        // Scroll to top when opening add mode
        if (isAdding) window.scrollTo(0, 0);
    }, [isAdding]);

    const templateExercises = useMemo(() => {
        if (!template) return [];
        // Map ID array to actual exercise objects, keeping order
        return template.exerciseIds.map(eId => allExercises.find(ex => ex.id === eId)).filter(Boolean) as Exercise[];
    }, [template, allExercises]);

    const filteredExercises = useMemo(() => {
        if (!searchTerm) return allExercises;
        const lowSearch = searchTerm.toLowerCase();
        return allExercises.filter(ex =>
            ex.name.toLowerCase().includes(lowSearch) ||
            ex.bodyPart?.toLowerCase().includes(lowSearch)
        );
    }, [allExercises, searchTerm]);

    if (!template) {
        return <div className="p-8 text-center text-secondary">Loading template...</div>;
    }

    if (isAdding) {
        return (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-300">
                <header className="flex items-center gap-3 mb-2 px-1 sticky top-0 bg-bg-base/80 backdrop-blur-xl z-20 py-4 -my-4">
                    <button onClick={() => setIsAdding(false)} className="p-2 -ml-2 text-accent rounded-full hover:bg-black/10 tap-highlight">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
                        <GlassInput
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Find exercise to add..."
                            className="pl-9 h-11 text-[15px] rounded-2xl w-full"
                            autoFocus
                        />
                    </div>
                </header>

                <div className="flex flex-col gap-2 pb-12">
                    {filteredExercises.map(ex => {
                        const isAlreadyAdded = template.exerciseIds.includes(ex.id);
                        return (
                            <GlassCard key={ex.id} variant="base" className={`p-2 flex items-center justify-between transition-all ${isAlreadyAdded ? 'opacity-50 grayscale' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <ExerciseImage exercise={ex} className="w-12 h-12 rounded-xl shadow-sm" />
                                    <div>
                                        <p className="font-semibold text-primary text-[15px]">{ex.name}</p>
                                        <p className="text-secondary text-[12px]">{ex.bodyPart || 'Various'}</p>
                                    </div>
                                </div>
                                <GlassButton
                                    size="sm"
                                    variant={isAlreadyAdded ? 'secondary' : 'primary'}
                                    disabled={isAlreadyAdded}
                                    onClick={() => addExercise(template.id, ex.id)}
                                    className="px-4 py-1.5 rounded-full text-[13px]"
                                >
                                    {isAlreadyAdded ? 'Added' : 'Add'}
                                </GlassButton>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            <header className="flex items-center justify-between mb-2 mt-2 px-1">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/templates')} className="p-2 -ml-2 text-accent rounded-full hover:bg-black/10 tap-highlight">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">{template.name}</h1>
                        <p className="text-secondary font-medium text-[13px]">{templateExercises.length} exercises</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-3 px-1 pb-20">
                {templateExercises.map((ex, idx) => (
                    <GlassCard key={ex.id + idx} variant="elevated" className="p-3 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <span className="text-tertiary font-bold text-sm w-4">{idx + 1}</span>
                            <ExerciseImage exercise={ex} className="w-12 h-12 rounded-xl shadow-sm" />
                            <div>
                                <p className="font-semibold text-primary text-[15px]">{ex.name}</p>
                                <p className="text-secondary text-[12px]">{ex.bodyPart}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeExercise(template.id, ex.id)}
                            className="p-2 text-tertiary hover:text-red-400 focus:text-red-400 bg-black/10 hover:bg-black/20 rounded-full transition-all tap-highlight"
                        >
                            <Trash2 size={16} />
                        </button>
                    </GlassCard>
                ))}

                <GlassButton
                    variant="secondary"
                    className="mt-4 p-4 border border-dashed border-glass-border/40 text-accent hover:border-accent/40 rounded-2xl flex flex-col items-center justify-center gap-2 tap-highlight shadow-none"
                    onClick={() => setIsAdding(true)}
                >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Plus size={20} />
                    </div>
                    <span className="font-semibold text-[14px]">Add Exercise</span>
                </GlassButton>
            </div>
        </div>
    );
}
