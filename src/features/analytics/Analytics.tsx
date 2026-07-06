import { useState, useEffect } from 'react';
import { db } from '../../data/db';
import { computeWeeklySummary, computeExerciseProgress, ExerciseProgressData, WeeklySummary } from '../../domain/analytics';
import { Exercise } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function Analytics() {
    const [summary, setSummary] = useState<WeeklySummary | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [progressData, setProgressData] = useState<ExerciseProgressData[]>([]);

    useEffect(() => {
        async function loadData() {
            const sessions = await db.workoutSessions.toArray();
            const entries = await db.workoutExerciseEntries.toArray();
            const sets = await db.setEntries.toArray();
            const prs = await db.prs.toArray();
            const allExercises = await db.exercises.toArray();

            setExercises(allExercises.sort((a, b) => a.name.localeCompare(b.name)));
            setSummary(computeWeeklySummary(sessions, entries, sets, prs));

            if (allExercises.length > 0 && !selectedExercise) {
                setSelectedExercise(allExercises[0].id);
            }

            if (selectedExercise) {
                setProgressData(computeExerciseProgress(sessions, entries, sets, selectedExercise));
            }
        }
        loadData();
    }, [selectedExercise]);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-200 pb-12">
            <header className="mb-6 mt-4 px-1">
                <h1 className="ios-title mb-1">Analytics</h1>
                <p className="ios-body text-[color:var(--text-secondary)]">Insights and progress</p>
            </header>

            {summary && (
                <section className="mb-8 px-1">
                    <h2 className="ios-caption font-bold text-[color:var(--text-tertiary)] mb-3 tracking-widest uppercase ml-1">Last 7 Days</h2>
                    <div className="flex flex-col gap-3">
                        <GlassCard variant="elevated" className="p-5">
                            <p className="text-[48px] leading-none font-extrabold tracking-tight tabular-nums text-[#30D158]">
                                {summary.totalVolume.toLocaleString()}
                            </p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-secondary mt-3">Volume (kg)</p>
                        </GlassCard>
                        <div className="grid grid-cols-2 gap-3">
                            <GlassCard variant="elevated" className="p-5">
                                <p className="text-[36px] leading-none font-extrabold tracking-tight tabular-nums text-[#0A84FF]">
                                    {summary.totalSessions}
                                </p>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-secondary mt-3">Sessions</p>
                            </GlassCard>
                            <GlassCard variant="elevated" className="p-5">
                                <p className="text-[36px] leading-none font-extrabold tracking-tight tabular-nums text-[#FF9F0A]">
                                    {summary.totalPRs}
                                </p>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-secondary mt-3">Records</p>
                            </GlassCard>
                        </div>
                    </div>
                </section>
            )}

            <section className="flex-1 pb-10 px-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3 ml-1">
                    <h2 className="ios-caption font-bold text-[color:var(--text-tertiary)] tracking-widest uppercase">Exercise Progress</h2>
                    <select
                        className="bg-glass-base rounded-xl px-3 py-2 ios-subhead font-semibold text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] w-full md:w-[200px] appearance-none"
                        value={selectedExercise}
                        onChange={e => setSelectedExercise(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                    >
                        {exercises.map(ex => (
                            <option key={ex.id} value={ex.id} className="bg-[#121214]">{ex.name}</option>
                        ))}
                    </select>
                </div>

                <GlassCard variant="base" className="p-5 min-h-[300px] mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-secondary">Max Weight (kg)</p>
                        <TrendingUp size={16} className="text-accent" />
                    </div>
                    {progressData.length > 0 ? (
                        <div className="-ml-4 -mr-2">
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={progressData}>
                                    <defs>
                                        <linearGradient id="maxWeightGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#0A84FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--glass-base)', border: '1px solid var(--glass-elevated)', borderRadius: '12px', color: 'var(--text-primary)' }} itemStyle={{ color: '#0A84FF', fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="maxWeight" stroke="#0A84FF" strokeWidth={3.5} fill="url(#maxWeightGradient)" dot={{ r: 4, fill: '#0A84FF', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#0A84FF', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="text-tertiary text-center mt-12 text-sm font-medium">No weight data available.</p>}
                </GlassCard>

                <GlassCard variant="base" className="p-5 min-h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-secondary">Total Volume (kg)</p>
                        <TrendingUp size={16} className="text-green-500" />
                    </div>
                    {progressData.length > 0 ? (
                        <div className="-ml-4 -mr-2">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={progressData}>
                                    <defs>
                                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#30D158" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#30D158" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--glass-base)', border: '1px solid var(--glass-elevated)', borderRadius: '12px', color: 'var(--text-primary)' }} itemStyle={{ color: '#30D158', fontWeight: 600 }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                    <Bar dataKey="totalVolume" fill="url(#volumeGradient)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="text-tertiary text-center mt-12 text-sm font-medium">No volume data available.</p>}
                </GlassCard>
            </section>
        </div>
    );
}
