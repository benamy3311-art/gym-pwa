import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../workout/store';
import { TemplateRepo } from '../../data/repositories';
import { Template } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Play, Plus } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const { startWorkout, activeSession, loadActiveWorkout } = useWorkoutStore();
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        loadActiveWorkout();
        TemplateRepo.getAll().then(setTemplates);
    }, []);

    const handleStartEmpty = async () => {
        await startWorkout('Empty Workout');
        navigate('/workout');
    };

    const handleStartTemplate = async (template: Template) => {
        await startWorkout(template.name, template.id);
        navigate('/workout');
    };

    if (activeSession) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 mt-20">
                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                    <Play size={40} className="text-blue-400 ml-2" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Workout in Progress</h2>
                    <p className="text-white/60">{activeSession.name}</p>
                </div>
                <GlassButton variant="primary" size="lg" onClick={() => navigate('/workout')} className="w-full max-w-xs py-4">
                    Resume Workout
                </GlassButton>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-2 mt-4">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">Ready to lift?</h1>
                <p className="text-white/60 text-lg">Start a new session or choose a template</p>
            </header>

            <GlassButton variant="primary" size="lg" onClick={handleStartEmpty} className="w-full py-5 text-lg shadow-blue-500/20 shadow-lg">
                Start Empty Workout
            </GlassButton>

            <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">My Templates</h2>
                    <GlassButton size="sm" onClick={() => navigate('/templates')} className="text-sm">
                        <Plus size={16} /> New
                    </GlassButton>
                </div>

                <div className="flex flex-col gap-3 pb-8">
                    {templates.length === 0 ? (
                        <p className="text-white/40 text-center py-10 glass-panel rounded-2xl border-dashed">No templates yet. Create one to get started.</p>
                    ) : (
                        templates.map(t => (
                            <GlassCard key={t.id} className="flex justify-between items-center group cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all" onClick={() => handleStartTemplate(t)}>
                                <div>
                                    <h3 className="font-semibold text-lg">{t.name}</h3>
                                    <p className="text-sm text-white/50 mt-1">{t.exerciseIds.length} exercises</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <Play size={20} className="text-white/50 group-hover:text-blue-400 ml-1" />
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
