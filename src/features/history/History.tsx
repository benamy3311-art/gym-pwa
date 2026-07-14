import { useEffect, useState } from 'react';
import { db } from '../../data/db';
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
            // Load each table once and group in memory instead of running a query
            // per session/entry (which got slow as history grew).
            const [allSessions, allEntries, allSets, allPrs] = await Promise.all([
                db.workoutSessions.toArray(),
                db.workoutExerciseEntries.toArray(),
                db.setEntries.toArray(),
                db.prs.toArray(),
            ]);

            const entryIdsBySession = new Map<string, string[]>();
            for (const e of allEntries) {
                const arr = entryIdsBySession.get(e.sessionId);
                if (arr) arr.push(e.id);
                else entryIdsBySession.set(e.sessionId, [e.id]);
            }

            const volumeByEntry = new Map<string, number>();
            for (const set of allSets) {
                if (!set.isDone) continue;
                volumeByEntry.set(set.entryId, (volumeByEntry.get(set.entryId) || 0) + set.weight * set.reps);
            }

            const prCountBySession = new Map<string, number>();
            for (const pr of allPrs) {
                prCountBySession.set(pr.sessionId, (prCountBySession.get(pr.sessionId) || 0) + 1);
            }

            const enriched: SessionData[] = allSessions
                .filter(s => s.endedAt)
                .map(s => {
                    const volume = (entryIdsBySession.get(s.id) || [])
                        .reduce((acc, entryId) => acc + (volumeByEntry.get(entryId) || 0), 0);
                    return { ...s, volume, prCount: prCountBySession.get(s.id) || 0 };
                });

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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-200 pb-8">
            <header className="mb-2 mt-4 px-1">
                <h1 className="ios-title mb-1">History</h1>
                <p className="ios-body text-[color:var(--text-secondary)]">Your past workouts</p>
            </header>

            <div className="flex flex-col gap-3 px-1">
                {sessions.map(s => (
                    <GlassCard key={s.id} variant="base" className="flex flex-col gap-3 group hover:bg-glass-elevated transition-colors cursor-pointer tap-highlight">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="ios-h3 group-hover:text-[color:var(--accent)] transition-colors text-[color:var(--text-primary)]">{s.name}</h3>
                                <p className="ios-caption text-[color:var(--text-secondary)] mt-1">
                                    {new Date(s.startedAt).toLocaleDateString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {s.prCount > 0 && (
                                <div className="bg-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                    <Medal size={14} /> {s.prCount} PR{s.prCount > 1 && 's'}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-5 mt-1 pt-3 border-t border-glass-elevated">
                            <div className="flex items-center gap-2 ios-subhead font-semibold text-[color:var(--text-primary)] opacity-90">
                                <Clock size={16} className="text-[color:var(--accent)]" />
                                {formatDuration(s.startedAt, s.endedAt)}
                            </div>
                            <div className="flex items-center gap-2 ios-subhead font-semibold text-[color:var(--text-primary)] opacity-90">
                                <TrendingUp size={16} className="text-green-500" />
                                {s.volume} {s.unit}
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {sessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 mt-2">
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
