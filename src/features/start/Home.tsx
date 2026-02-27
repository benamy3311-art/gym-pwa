import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../workout/store';
import { TemplateRepo } from '../../data/repositories';
import { Template } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Play, Plus, ListVideo } from 'lucide-react';
import { sortTemplates } from '../../utils/templateUtils';
import { startWorkoutFromTemplate } from '../workout/startWorkoutFromTemplate';

export default function Home() {
    const navigate = useNavigate();
    const { startWorkout, activeSession, loadActiveWorkout } = useWorkoutStore();
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        loadActiveWorkout();
        TemplateRepo.getAll().then(data => setTemplates(sortTemplates(data)));
    }, []);

    const handleStartEmpty = async () => {
        await startWorkout('Empty Workout');
        navigate('/workout');
    };

    const handleStartTemplate = async (template: Template) => {
        try {
            await startWorkoutFromTemplate(template.id);
            await loadActiveWorkout();
            navigate('/workout');
        } catch (error: any) {
            alert(error.message || 'Error starting workout');
        }
    };

    if (activeSession) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 mt-20 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-28 h-28 bg-accent/20 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(10,132,255,0.4)]">
                    <Play size={44} className="text-accent ml-2" />
                </div>
                <div className="text-center mt-4">
                    <h2 className="ios-h2 mb-1">Workout in Progress</h2>
                    <p className="ios-body text-[color:var(--text-secondary)]">{activeSession.name}</p>
                </div>
                <GlassButton variant="primary" size="lg" onClick={() => navigate('/workout')} className="w-full max-w-xs py-4 mt-6">
                    Resume Workout
                </GlassButton>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-2 mt-4 px-1">
                <h1 className="ios-title mb-2">Ready to lift?</h1>
                <p className="ios-body text-[color:var(--text-secondary)]">Start a new session or choose a routine</p>
            </header>

            <GlassButton variant="primary" size="lg" onClick={handleStartEmpty} className="w-full py-5 text-lg shadow-glass-sm mx-1">
                Start Empty Workout
            </GlassButton>

            <div className="mt-6 px-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="ios-h2">My Routines</h2>
                    <GlassButton size="sm" onClick={() => navigate('/templates')} className="text-sm px-3 rounded-full">
                        <Plus size={16} /> New
                    </GlassButton>
                </div>

                <div className="flex flex-col gap-3 pb-8">
                    {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-secondary text-center py-12 px-6 bg-glass-inset rounded-3xl border border-glass-border/30">
                            <ListVideo size={40} className="text-tertiary mb-3 opacity-50" />
                            <p className="font-medium text-[15px]">No routines yet.</p>
                            <p className="text-sm text-tertiary mt-1">Create one to get started quickly.</p>
                        </div>
                    ) : (
                        templates.map(t => (
                            <GlassCard
                                key={t.id}
                                variant="elevated"
                                className="tap-highlight flex justify-between items-center group cursor-pointer"
                                onClick={() => handleStartTemplate(t)}
                            >
                                <div>
                                    <h3 className="ios-h3">{t.name}</h3>
                                    <p className="ios-subhead text-[color:var(--text-secondary)] mt-1">{t.exerciseIds.length} exercises</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors shadow-inner-dark">
                                    <Play size={18} className="text-tertiary group-hover:text-accent ml-0.5 transition-colors" />
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
