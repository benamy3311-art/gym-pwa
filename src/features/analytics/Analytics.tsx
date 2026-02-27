import { useState, useEffect } from 'react';
import { db } from '../../data/db';
import { computeWeeklySummary, computeExerciseProgress, ExerciseProgressData, WeeklySummary } from '../../domain/analytics';
import { Exercise } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <header className="mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Analytics
                </h1>
            </header>

            {summary && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-white/80 mb-4 tracking-wide uppercase">Last 7 Days</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <GlassCard className="p-4 text-center flex flex-col justify-center">
                            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-purple-400">{summary.totalSessions}</p>
                            <p className="text-xs text-white/50 uppercase mt-1">Sessions</p>
                        </GlassCard>
                        <GlassCard className="p-4 text-center flex flex-col justify-center">
                            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-emerald-400">{summary.totalVolume}</p>
                            <p className="text-xs text-white/50 uppercase mt-1">Volume (kg)</p>
                        </GlassCard>
                        <GlassCard className="p-4 text-center flex flex-col justify-center">
                            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-amber-400 to-orange-400">{summary.totalPRs}</p>
                            <p className="text-xs text-white/50 uppercase mt-1">Records</p>
                        </GlassCard>
                    </div>
                </section>
            )}

            <section className="flex-1 pb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white/80 tracking-wide uppercase">Progress</h2>
                    <select
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px]"
                        value={selectedExercise}
                        onChange={e => setSelectedExercise(e.target.value)}
                    >
                        {exercises.map(ex => (
                            <option key={ex.id} value={ex.id} className="bg-[#121214]">{ex.name}</option>
                        ))}
                    </select>
                </div>

                <GlassCard className="p-4 min-h-[300px] mb-4">
                    <p className="text-sm text-white/60 mb-2">Max Weight Progression (kg)</p>
                    {progressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={progressData}>
                                <XAxis dataKey="date" stroke="#ffffff60" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#ffffff60" fontSize={10} tickMargin={10} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="maxWeight" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="text-white/40 text-center mt-10 text-sm">No data available for this exercise.</p>}
                </GlassCard>

                <GlassCard className="p-4 min-h-[300px]">
                    <p className="text-sm text-white/60 mb-2">Total Volume Progression (kg)</p>
                    {progressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={progressData}>
                                <XAxis dataKey="date" stroke="#ffffff60" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#ffffff60" fontSize={10} tickMargin={10} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="totalVolume" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-white/40 text-center mt-10 text-sm">No data available for this exercise.</p>}
                </GlassCard>
            </section>
        </div>
    );
}
