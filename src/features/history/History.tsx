import { useEffect, useState } from 'react';
import { WorkoutRepo, PRRepo } from '../../data/repositories';
import { WorkoutSession } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { DataManagement } from '../settings/DataManagement';
import { Clock, TrendingUp, Medal, History as HistoryIcon } from 'lucide-react';

interface SessionData extends WorkoutSession {
    volume: number;
    prCount: number;
}

export default function History() {
    const [sessions, setSessions] = useState<SessionData[]>([]);

    useEffect(() => {
        async function loadHistory() {
            const all = await WorkoutRepo.getAllSessions();
            const finished = all.filter(s => s.endedAt);

            const enriched: SessionData[] = [];
            for (const s of finished) {
                // Calculate volume
                const entries = await WorkoutRepo.getSessionExercises(s.id);
                let vol = 0;
                for (const e of entries) {
                    const sets = await WorkoutRepo.getSetsForEntry(e.id);
                    vol += sets.filter(x => x.isDone).reduce((acc, set) => acc + (set.weight * set.reps), 0);
                }

                // Count PRs
                const prCount = await PRRepo.countPRsForSession(s.id);

                enriched.push({ ...s, volume: vol, prCount });
            }
            // Sort by latest completed first
            enriched.sort((a, b) => b.endedAt! - a.endedAt!);
            setSessions(enriched);
        }
        loadHistory();
    }, []);

    const formatDuration = (start: number, end?: number) => {
        if (!end) return 'Ongoing';
        const mins = Math.round((end - start) / 60000);
        return `${mins} min`;
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <header className="mb-2 mt-4 px-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-1">History</h1>
                <p className="text-secondary text-lg font-medium">Your past workouts</p>
            </header>

            <div className="flex flex-col gap-3 px-1">
                {sessions.map(s => (
                    <GlassCard key={s.id} variant="base" className="flex flex-col gap-3 group hover:bg-white/10 transition-colors cursor-pointer tap-highlight">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-[22px] tracking-tight group-hover:text-accent transition-colors text-primary">{s.name}</h3>
                                <p className="text-[13px] text-secondary font-medium mt-1">
                                    {new Date(s.startedAt).toLocaleDateString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {s.prCount > 0 && (
                                <div className="bg-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)] border border-amber-500/30">
                                    <Medal size={14} /> {s.prCount} PR{s.prCount > 1 && 's'}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-5 mt-1 pt-3 border-t border-glass-border/30">
                            <div className="flex items-center gap-2 text-[15px] font-semibold text-primary/90">
                                <Clock size={16} className="text-accent" />
                                {formatDuration(s.startedAt, s.endedAt)}
                            </div>
                            <div className="flex items-center gap-2 text-[15px] font-semibold text-primary/90">
                                <TrendingUp size={16} className="text-green-500" />
                                {s.volume} {s.unit}
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {sessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-glass-inset rounded-3xl border border-glass-border/30 mt-2">
                        <HistoryIcon size={48} className="text-tertiary mb-4 opacity-50" />
                        <p className="font-medium text-primary text-lg tracking-tight">No history found.</p>
                        <p className="text-[15px] text-secondary mt-1 max-w-[200px]">Complete your first workout and it will appear here.</p>
                    </div>
                )}
            </div>

            <div className="px-1 mt-4">
                <DataManagement />
            </div>
        </div>
    );
}
