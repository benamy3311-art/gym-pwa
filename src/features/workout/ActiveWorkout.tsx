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
import { RestTimerOverlay } from './RestTimerOverlay';
import { BodyPartIcon } from '../../ui/anatomy/BodyPartIcon';

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
            <header className="flex flex-col gap-2 pt-2 sticky top-0 bg-glass-base/90 backdrop-blur-2xl z-20 pb-4 border-b border-glass-border/30 shadow-sm mx-[-16px] px-4 md:mx-0 md:px-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl flex items-center gap-2 font-bold tracking-tight text-primary">
                            {activeSession.name}
                        </h1>
                        <p className="text-sm text-accent font-mono flex items-center gap-1.5 mt-0.5 font-medium">
                            <Clock size={16} /> {duration}
                        </p>
                    </div>
                    <GlassButton variant="primary" size="sm" onClick={handleFinish} className="px-6 py-2 shadow-glass-sm rounded-full">
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
                        <GlassCard key={entry.id} variant="elevated" className="flex flex-col gap-4 p-4 md:p-6 mb-2">
                            <div className="flex justify-between items-center border-b border-glass-border/30 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center border border-white/5">
                                        <BodyPartIcon bodyPart={ex?.bodyPart} variant="front" size="sm" />
                                    </div>
                                    <h3 className="font-bold text-lg text-primary tracking-tight">{ex?.name || 'Unknown Exercise'}</h3>
                                </div>
                                <button
                                    onClick={() => confirm('Remove exercise?') && removeExercise(entry.id)}
                                    className="text-tertiary hover:text-red-400 hover:bg-black/20 p-2 rounded-full transition-all tap-highlight"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Headings */}
                            <div className="grid grid-cols-[30px_1fr_1fr_1fr_40px] md:grid-cols-[40px_1fr_1fr_1fr_50px] gap-2 text-[11px] font-semibold text-secondary uppercase tracking-wider px-1">
                                <div className="text-center">Set</div>
                                <div className="text-center opacity-70">Prev</div>
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
                                            className={`grid grid-cols-[30px_1fr_1fr_1fr_40px] md:grid-cols-[40px_1fr_1fr_1fr_50px] gap-2 items-center transition-all duration-300 ${set.isDone ? 'opacity-60 grayscale-[50%]' : ''}`}
                                        >
                                            <div className="text-center font-mono text-tertiary text-[13px] font-bold">
                                                {index + 1}
                                            </div>

                                            <div className="text-center font-mono text-secondary text-[11px] md:text-xs flex items-center justify-center bg-black/10 rounded-xl h-12 shadow-inner-dark border border-white/5">
                                                {prevStr}
                                            </div>

                                            <GlassInput
                                                type="number"
                                                inputMode="decimal"
                                                value={set.weight || ''}
                                                onChange={e => updateSet(set.id, entry.id, { weight: parseFloat(e.target.value) || 0 })}
                                                placeholder="-"
                                                className="h-12 text-center font-bold text-base px-1 bg-black/20"
                                                disabled={set.isDone}
                                            />

                                            <GlassInput
                                                type="number"
                                                inputMode="numeric"
                                                value={set.reps || ''}
                                                onChange={e => updateSet(set.id, entry.id, { reps: parseInt(e.target.value) || 0 })}
                                                placeholder="-"
                                                className="h-12 text-center font-bold text-base px-1 bg-black/20"
                                                disabled={set.isDone}
                                            />

                                            <button
                                                onClick={async () => {
                                                    const result = await toggleSetDone(set.id, entry.id, entry.exerciseId);
                                                    if (result && result.isNewlyDone) {
                                                        const ex = exercises.find(e => e.id === entry.exerciseId);
                                                        startRest(90000, {
                                                            sessionId: activeSession.id,
                                                            entryId: entry.id,
                                                            exerciseId: entry.exerciseId,
                                                            exerciseName: ex ? ex.name : 'Unknown Exercise',
                                                            setEntryId: set.id,
                                                            setNumber: result.setNumber
                                                        });
                                                    }
                                                }}
                                                className={`h-12 rounded-2xl flex items-center justify-center transition-all tap-highlight ${set.isDone
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.25)]'
                                                    : 'bg-glass-inset text-tertiary hover:bg-black/30 hover:text-secondary border border-glass-border/30 shadow-inner-dark'
                                                    }`}
                                            >
                                                <Check size={20} strokeWidth={set.isDone ? 3.5 : 2} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => addSet(entry.id, 0, 0)}
                                className="mt-3 text-sm text-accent font-semibold py-3 hover:bg-accent/10 rounded-2xl border border-accent/20 transition-colors flex items-center justify-center gap-1.5 tap-highlight"
                            >
                                <Plus size={18} /> Add Set
                            </button>
                        </GlassCard>
                    );
                })}

                {entries.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-glass-inset rounded-3xl border border-glass-border/30 mt-4">
                        <Timer size={48} className="text-tertiary mb-4 opacity-50" />
                        <p className="font-medium text-primary text-lg tracking-tight">Empty session</p>
                        <p className="text-[15px] text-secondary mt-1 max-w-[200px]">Add some exercises to start recording your sets.</p>
                    </div>
                )}

                <GlassButton
                    variant="secondary"
                    className="border border-accent/30 text-accent py-4 font-semibold shadow-glass-sm rounded-full"
                    onClick={() => setShowAdd(true)}
                >
                    <Plus size={22} /> Add Exercise
                </GlassButton>

                <GlassButton variant="ghost" className="text-red-400/80 hover:text-red-400 hover:bg-red-400/10 mt-4 mb-8 py-3 rounded-full" onClick={handleCancel}>
                    Cancel Workout
                </GlassButton>
            </div>

            {lastDoneSet && (
                <div className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:w-auto md:right-6 bg-glass-elevated backdrop-blur-3xl border border-glass-border rounded-full p-2 flex shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-40 animate-in slide-in-from-bottom-10 fade-in duration-400 ease-spring">
                    <GlassButton size="md" onClick={() => undoLastSet()} className="flex-1 px-6 bg-black/30 border-white/5 text-secondary shadow-inner-dark hover:text-primary rounded-full">
                        <Undo2 size={18} /> Undo Set
                    </GlassButton>
                </div>
            )}

            {showAdd && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end md:items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-glass-elevated w-full md:w-[460px] md:rounded-[32px] rounded-t-[32px] border border-glass-border/50 p-5 md:p-6 flex flex-col h-[80vh] md:h-[650px] animate-in slide-in-from-bottom-full md:zoom-in-95 duration-400 ease-spring shadow-2xl">
                        <div className="flex justify-between items-center mb-5 mt-1">
                            <h3 className="text-2xl font-extrabold tracking-tight text-primary">Add Exercise</h3>
                            <button onClick={() => setShowAdd(false)} className="text-secondary p-2 bg-black/10 hover:bg-black/20 hover:text-primary rounded-full transition-colors tap-highlight shadow-inner-dark">Close</button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" size={20} />
                            <GlassInput type="text" placeholder="Search exercises..." className="pl-12 h-14 bg-black/10 border-black/10 rounded-2xl text-lg font-medium" />
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 pb-4">
                            {exercises.map(ex => (
                                <button
                                    key={ex.id}
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-colors border border-glass-border/30 tap-highlight shadow-sm"
                                    onClick={() => {
                                        addExercise(ex.id);
                                        setShowAdd(false);
                                    }}
                                >
                                    <span className="font-semibold text-[17px] text-primary tracking-tight">{ex.name}</span>
                                    <div className="bg-accent/20 text-accent p-1.5 rounded-full">
                                        <Plus size={20} />
                                    </div>
                                </button>
                            ))}
                            {exercises.length === 0 && (
                                <p className="text-tertiary text-center py-10 font-medium">No exercises available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <RestTimerOverlay />
        </div>
    );
}
