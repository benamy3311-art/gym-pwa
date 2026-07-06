import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../workout/store';
import { TemplateRepo } from '../../data/repositories';
import { db } from '../../data/db';
import { Template } from '../../domain/models';
import { computeHomeStats, HomeStats } from '../../domain/analytics';
import { computeBodyPartRecency, BodyPartRecency } from '../../domain/recovery';
import { MuscleRecoveryMap } from '../../ui/anatomy/MuscleRecoveryMap';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { Play, Plus, ListVideo, Flame, Dumbbell } from 'lucide-react';
import { sortTemplates } from '../../utils/templateUtils';
import { startWorkoutFromTemplate } from '../workout/startWorkoutFromTemplate';

export default function Home() {
    const navigate = useNavigate();
    const { startWorkout, activeSession, loadActiveWorkout } = useWorkoutStore();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [stats, setStats] = useState<HomeStats | null>(null);
    const [recency, setRecency] = useState<BodyPartRecency | null>(null);

    useEffect(() => {
        loadActiveWorkout();
        TemplateRepo.getAll().then(data => setTemplates(sortTemplates(data)));

        (async () => {
            const [sessions, entries, sets, exercises] = await Promise.all([
                db.workoutSessions.toArray(),
                db.workoutExerciseEntries.toArray(),
                db.setEntries.toArray(),
                db.exercises.toArray()
            ]);
            setStats(computeHomeStats(sessions, entries, sets));
            setRecency(computeBodyPartRecency(sessions, entries, exercises));
        })();
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
            <div className="flex flex-col items-center justify-center flex-1 gap-6 mt-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-28 h-28 bg-[#FF3B30]/15 rounded-full flex items-center justify-center animate-pulse">
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
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
            <header className="mb-2 mt-4 px-1">
                <h1 className="ios-title mb-2">Ready to lift?</h1>
                <p className="ios-body text-[color:var(--text-secondary)]">Start a new session or choose a routine</p>
            </header>

            {/* Hero stats: streak + weekly volume */}
            <div className="grid grid-cols-2 gap-3 px-1">
                <GlassCard variant="elevated" className="p-5 flex flex-col justify-between min-h-[110px]">
                    <p className="text-[44px] leading-none font-extrabold tracking-tight tabular-nums">
                        {stats ? stats.streakDays : '–'}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-secondary flex items-center gap-1.5 mt-3">
                        <Flame size={13} className="text-accent" /> Day streak
                    </p>
                </GlassCard>
                <GlassCard variant="elevated" className="p-5 flex flex-col justify-between min-h-[110px]">
                    <p className="text-[44px] leading-none font-extrabold tracking-tight tabular-nums">
                        {stats ? Math.round(stats.weeklyVolume).toLocaleString() : '–'}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-secondary flex items-center gap-1.5 mt-3">
                        <Dumbbell size={13} className="text-accent" /> kg this week
                    </p>
                </GlassCard>
            </div>

            {/* Muscle recovery heatmap */}
            {recency && (
                <GlassCard variant="elevated" className="p-5 mx-1">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-secondary mb-4">Muscle Recovery</h2>
                    <MuscleRecoveryMap recency={recency} />
                </GlassCard>
            )}

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
                        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                            <ListVideo size={36} className="text-[color:var(--text-tertiary)] mb-3" />
                            <p className="ios-body font-medium text-[color:var(--text-secondary)]">No routines yet</p>
                            <p className="ios-subhead text-[color:var(--text-tertiary)] mt-1">Create one to get started quickly.</p>
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
                                <div className="w-10 h-10 rounded-full bg-glass-elevated flex items-center justify-center group-hover:bg-[#FF3B30]/15 transition-colors">
                                    <Play size={18} className="text-[color:var(--text-secondary)] group-hover:text-[color:var(--accent)] ml-0.5 transition-colors" />
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
