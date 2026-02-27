import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from './store';
import { useRestStore } from './restStore';
import { ExerciseRepo } from '../../data/repositories';
import { Exercise } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { GlassInput } from '../../ui/GlassInput';
import { Plus, Trash2, Check, Clock, Search, Undo2, Timer } from 'lucide-react';

export default function ActiveWorkout() {
    const navigate = useNavigate();
    const {
        activeSession, entries, setsByEntry, previousSetsByExercise, lastDoneSet,
        finishWorkout, cancelWorkout,
        addExercise, addSet, updateSet, toggleSetDone, removeExercise,
        loadPreviousSets, undoLastSet
    } = useWorkoutStore();
    const { startRest } = useRestStore();

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [duration, setDuration] = useState('00:00');

    useEffect(() => {
        if (!activeSession) {
            navigate('/');
            return;
        }

        ExerciseRepo.getAll().then(setExercises);

        const interval = setInterval(() => {
            const ms = Date.now() - activeSession.startedAt;
            const totalSeconds = Math.floor(ms / 1000);
            const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');

            let h = '';
            if (totalSeconds >= 3600) {
                h = Math.floor(totalSeconds / 3600).toString() + ':';
            }
            setDuration(`${h}${m}:${s}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSession, navigate]);

    useEffect(() => {
        entries.forEach(entry => {
            loadPreviousSets(entry.exerciseId);
        });
    }, [entries, loadPreviousSets]);

    if (!activeSession) return null;

    const handleFinish = async () => {
        await finishWorkout();
        navigate('/history');
    };

    const handleCancel = async () => {
        if (confirm('Cancel workout? No data will be saved.')) {
            await cancelWorkout();
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            <header className="flex flex-col gap-2 pt-2 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl flex items-center gap-2 font-bold tracking-tight">
                            {activeSession.name}
                        </h1>
                        <p className="text-sm text-blue-400 font-mono flex items-center gap-1 mt-1">
                            <Clock size={14} /> {duration}
                        </p>
                    </div>
                    <GlassButton variant="primary" size="sm" onClick={handleFinish} className="px-6 shadow-blue-500/20 shadow-lg">
                        Finish
                    </GlassButton>
                </div>
            </header>

            {/* Exercises List */}
            <div className="flex flex-col gap-6 mt-2">
                {entries.map(entry => {
                    const ex = exercises.find(e => e.id === entry.exerciseId);
                    const sets = setsByEntry[entry.id] || [];

                    return (
                        <GlassCard key={entry.id} className="flex flex-col gap-3 p-3 md:p-5">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-lg text-blue-100">{ex?.name || 'Unknown Exercise'}</h3>
                                <button
                                    onClick={() => confirm('Remove exercise?') && removeExercise(entry.id)}
                                    className="text-white/40 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-full transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Headings */}
                            <div className="grid grid-cols-[30px_1fr_1fr_1fr_40px] md:grid-cols-[40px_1fr_1fr_1fr_50px] gap-2 text-[10px] md:text-xs font-medium text-white/50 uppercase tracking-wider px-2">
                                <div className="text-center">Set</div>
                                <div className="text-center">Prev</div>
                                <div className="text-center">{activeSession.unit}</div>
                                <div className="text-center">Reps</div>
                                <div className="text-center">✓</div>
                            </div>

                            {/* Sets */}
                            <div className="flex flex-col gap-2">
                                {sets.map((set, index) => {
                                    const prevSet = previousSetsByExercise[entry.exerciseId]?.[index];
                                    const prevStr = prevSet ? `${prevSet.weight}x${prevSet.reps}` : '-';

                                    return (
                                        <div
                                            key={set.id}
                                            className={`grid grid-cols-[30px_1fr_1fr_1fr_40px] md:grid-cols-[40px_1fr_1fr_1fr_50px] gap-2 items-center transition-all ${set.isDone ? 'opacity-50 grayscale' : ''}`}
                                        >
                                            <div className="text-center font-mono text-white/60 text-sm font-medium">
                                                {index + 1}
                                            </div>

                                            <div className="text-center font-mono text-white/40 text-[10px] md:text-xs flex items-center justify-center bg-white/5 rounded-xl h-12">
                                                {prevStr}
                                            </div>

                                            <GlassInput
                                                type="number"
                                                inputMode="decimal"
                                                value={set.weight || ''}
                                                onChange={e => updateSet(set.id, entry.id, { weight: parseFloat(e.target.value) || 0 })}
                                                placeholder="-"
                                                className="h-12 text-center font-semibold text-base px-1"
                                                disabled={set.isDone}
                                            />

                                            <GlassInput
                                                type="number"
                                                inputMode="numeric"
                                                value={set.reps || ''}
                                                onChange={e => updateSet(set.id, entry.id, { reps: parseInt(e.target.value) || 0 })}
                                                placeholder="-"
                                                className="h-12 text-center font-semibold text-base px-1"
                                                disabled={set.isDone}
                                            />

                                            <button
                                                onClick={() => toggleSetDone(set.id, entry.id, entry.exerciseId)}
                                                className={`h-12 rounded-xl flex items-center justify-center transition-all ${set.isDone
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                    : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white border border-transparent'
                                                    }`}
                                            >
                                                <Check size={20} strokeWidth={set.isDone ? 3 : 2} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>

                            <button
                                onClick={() => addSet(entry.id, 0, 0)}
                                className="mt-2 text-sm text-blue-400 font-medium py-3 hover:bg-blue-500/10 rounded-xl border border-blue-500/20 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Plus size={16} /> Add Set
                            </button>
                        </GlassCard>
                    );
                })}

                {entries.length === 0 && (
                    <p className="text-center text-white/40 py-10 glass-panel rounded-2xl border-dashed">No exercises added yet. Start your workout!</p>
                )}

                <GlassButton
                    variant="secondary"
                    className="border border-white/20 text-blue-400 py-4 font-semibold shadow-lg shadow-black/50"
                    onClick={() => setShowAdd(true)}
                >
                    <Plus size={20} /> Add Exercise
                </GlassButton>

                <GlassButton variant="ghost" className="text-red-400/80 hover:text-red-400 mt-8 mb-8" onClick={handleCancel}>
                    Cancel Workout
                </GlassButton>
            </div>

            {lastDoneSet && (
                <div className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:w-[360px] md:right-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-3 flex gap-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <GlassButton size="sm" onClick={() => undoLastSet()} className="flex-1 bg-black/40 hover:bg-black/60 border-white/10 text-white/80">
                        <Undo2 size={16} /> Undo Set
                    </GlassButton>
                    <GlassButton variant="primary" size="sm" onClick={() => startRest(90)} className="flex-1 shadow-blue-500/20 shadow-lg">
                        <Timer size={16} /> Rest 90s
                    </GlassButton>
                </div>
            )}

            {showAdd && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-[#121214] w-full md:w-[400px] md:rounded-2xl rounded-t-3xl border border-white/10 p-4 md:p-6 flex flex-col h-[75vh] md:h-[600px] animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Exercise</h3>
                            <button onClick={() => setShowAdd(false)} className="text-white/50 p-2 hover:bg-white/10 rounded-full transition-colors">Close</button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <GlassInput type="text" placeholder="Search..." className="pl-10 h-12" />
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
                            {exercises.map(ex => (
                                <button
                                    key={ex.id}
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/10 text-left transition-colors border border-transparent shadow-sm"
                                    onClick={() => {
                                        addExercise(ex.id);
                                        setShowAdd(false);
                                    }}
                                >
                                    <span className="font-medium text-lg">{ex.name}</span>
                                    <Plus size={20} className="text-blue-400" />
                                </button>
                            ))}
                            {exercises.length === 0 && (
                                <p className="text-white/50 text-center py-8">No exercises available. Create one in the Exercises tab.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
