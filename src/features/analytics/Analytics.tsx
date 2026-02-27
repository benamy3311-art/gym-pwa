import { useState, useEffect } from 'react';
import { db } from '../../data/db';
import { computeWeeklySummary, computeExerciseProgress, ExerciseProgressData, WeeklySummary } from '../../domain/analytics';
import { Exercise } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <header className="mb-6 mt-4 px-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-1">
                    Analytics
                </h1>
                <p className="text-secondary text-lg font-medium">Insights and progress</p>
            </header>

            {summary && (
                <section className="mb-8 px-1">
                    <h2 className="text-[13px] font-bold text-tertiary mb-3 tracking-widest uppercase ml-1">Last 7 Days</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <GlassCard variant="elevated" className="p-4 text-center flex flex-col justify-center border-t border-t-blue-500/20">
                            <p className="text-3xl font-extrabold tracking-tighter text-blue-400">{summary.totalSessions}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-secondary uppercase mt-1 tracking-wider">Sessions</p>
                        </GlassCard>
                        <GlassCard variant="elevated" className="p-4 text-center flex flex-col justify-center border-t border-t-green-500/20">
                            <p className="text-3xl font-extrabold tracking-tighter text-green-400">{summary.totalVolume}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-secondary uppercase mt-1 tracking-wider">Volume <span className="text-[9px] opacity-70">(kg)</span></p>
                        </GlassCard>
                        <GlassCard variant="elevated" className="p-4 text-center flex flex-col justify-center border-t border-t-amber-500/20">
                            <p className="text-3xl font-extrabold tracking-tighter text-amber-500">{summary.totalPRs}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-secondary uppercase mt-1 tracking-wider">Records</p>
                        </GlassCard>
                    </div>
                </section>
            )}

            <section className="flex-1 pb-10 px-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3 ml-1">
                    <h2 className="text-[13px] font-bold text-tertiary tracking-widest uppercase">Exercise Progress</h2>
                    <select
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-accent w-full md:w-[200px] shadow-inner-dark appearance-none"
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
                                <LineChart data={progressData}>
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#0a84ff', fontWeight: 600 }} />
                                    <Line type="monotone" dataKey="maxWeight" stroke="#0a84ff" strokeWidth={3} dot={{ r: 4, fill: '#0a84ff', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#0a84ff', strokeWidth: 2 }} />
                                </LineChart>
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
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#32d74b', fontWeight: 600 }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="totalVolume" fill="#32d74b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="text-tertiary text-center mt-12 text-sm font-medium">No volume data available.</p>}
                </GlassCard>
            </section>
        </div>
    );
}
