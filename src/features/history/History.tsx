import { useEffect, useState } from 'react';
import { WorkoutRepo, PRRepo } from '../../data/repositories';
import { WorkoutSession } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { DataManagement } from '../settings/DataManagement';
import { Clock, TrendingUp, Medal } from 'lucide-react';

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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-2 mt-4">
                <h1 className="text-3xl font-bold tracking-tight">History</h1>
                <p className="text-white/60">Your past workouts</p>
            </header>

            <div className="flex flex-col gap-4 pb-8">
                {sessions.map(s => (
                    <GlassCard key={s.id} className="flex flex-col gap-3 group hover:border-white/20 transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-xl group-hover:text-blue-200 transition-colors">{s.name}</h3>
                                <p className="text-sm text-white/50 mt-1">
                                    {new Date(s.startedAt).toLocaleDateString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {s.prCount > 0 && (
                                <div className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-500/30">
                                    <Medal size={12} /> {s.prCount} PR{s.prCount > 1 && 's'}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-2 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                                <Clock size={16} className="text-blue-400" />
                                {formatDuration(s.startedAt, s.endedAt)}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                                <TrendingUp size={16} className="text-green-400" />
                                {s.volume} {s.unit}
                            </div>
                        </div>
                    </GlassCard>
                ))}
                {sessions.length === 0 && (
                    <p className="text-center text-white/40 py-10 glass-panel rounded-2xl border-dashed">No history available yet.</p>
                )}
            </div>

            <DataManagement />
        </div>
    );
}
