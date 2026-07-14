import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useWorkoutStore } from './store';
import { useRestStore } from './restStore';
import { useAuthStore } from '../../store/authStore';
import { ExerciseRepo } from '../../data/repositories';
import { syncNow } from '../../data/cloudSync';
import { Exercise, SetEntry } from '../../domain/models';
import { GlassCard } from '../../ui/GlassCard';
import { GlassButton } from '../../ui/GlassButton';
import { GlassInput } from '../../ui/GlassInput';
import { Plus, Minus, Trash2, Check, Clock, Search, Undo2, Timer, Trophy } from 'lucide-react';
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
    // Local drafts for weight inputs so partial decimals like "3." aren't
    // clobbered by the parsed value round-tripping through the store.
    const [weightDrafts, setWeightDrafts] = useState<Record<string, string>>({});
    // Transient PR celebration banner (auto-dismisses).
    const [prToast, setPrToast] = useState<string | null>(null);
    const prToastTimeout = useRef<number | null>(null);

    useEffect(() => () => {
        if (prToastTimeout.current) clearTimeout(prToastTimeout.current);
    }, []);

    // Stepper helpers: commit through the same updateSet path as typing.
    // Read the freshest set from the store so rapid taps don't hit stale closures.
    const latestSet = (setId: string, entryId: string): SetEntry | undefined =>
        useWorkoutStore.getState().setsByEntry[entryId]?.find(s => s.id === setId);

    const stepWeight = (setId: string, entryId: string, delta: number) => {
        const current = latestSet(setId, entryId);
        if (!current) return;
        const draft = weightDrafts[setId];
        const parsedDraft = draft !== undefined ? parseFloat(draft.replace(',', '.')) : NaN;
        const base = Number.isFinite(parsedDraft) ? parsedDraft : (current.weight || 0);
        const next = Math.max(0, Math.round((base + delta) * 100) / 100);
        // Clear any draft so the committed value is displayed.
        setWeightDrafts(prev => {
            if (prev[setId] === undefined) return prev;
            const copy = { ...prev };
            delete copy[setId];
            return copy;
        });
        updateSet(setId, entryId, { weight: next });
    };

    const stepReps = (setId: string, entryId: string, delta: number) => {
        const current = latestSet(setId, entryId);
        if (!current) return;
        updateSet(setId, entryId, { reps: Math.max(0, (current.reps || 0) + delta) });
    };

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
        // Back up the just-finished session right away instead of waiting for the
        // periodic auto-sync, so it's safe even if the app is force-closed after.
        const { user } = useAuthStore.getState();
        if (user) syncNow(user).catch(console.error);
    };

    const handleCancel = async () => {
        if (confirm('Cancel workout? No data will be saved.')) {
            await cancelWorkout();
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-200 pb-24">
            <header className="flex flex-col gap-2 pt-2 sticky top-0 bg-background z-20 pb-4 border-b border-glass-base mx-[-16px] px-4 md:mx-0 md:px-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="ios-h1 flex items-center gap-2">
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
                            <div className="flex justify-between items-center border-b border-glass-elevated pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-glass-inset flex items-center justify-center">
                                        <BodyPartIcon bodyPart={ex?.bodyPart} variant="front" size="sm" />
                                    </div>
                                    <h3 className="ios-h3 truncate max-w-[200px]">{ex?.name || 'Unknown Exercise'}</h3>
                                </div>
                                <button
                                    onClick={() => confirm('Remove exercise?') && removeExercise(entry.id)}
                                    className="text-tertiary hover:text-red-400 hover:bg-black/20 p-2 rounded-full transition-all tap-highlight"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Headings */}
                            <div className="grid grid-cols-[18px_44px_1.15fr_1fr_38px] gap-1.5 ios-caption font-bold text-secondary uppercase tracking-tighter mb-1">
                                <div className="text-center opacity-70">#</div>
                                <div className="text-center opacity-50">Prev</div>
                                <div className="text-center opacity-80">{activeSession.unit}</div>
                                <div className="text-center opacity-80">Reps</div>
                                <div className="text-center opacity-70">✓</div>
                            </div>

                            {/* Sets */}
                            <div className="flex flex-col gap-3">
                                {sets.map((set, index) => {
                                    const prevSet = previousSetsByExercise[entry.exerciseId]?.[index];
                                    const prevStr = prevSet ? `${prevSet.weight}x${prevSet.reps}` : '-';

                                    return (
                                        <div
                                            key={set.id}
                                            className={`grid grid-cols-[18px_44px_1.15fr_1fr_38px] gap-1.5 items-center transition-all duration-300 ${set.isDone ? 'opacity-50 grayscale-[40%]' : ''}`}
                                        >
                                            <div className="text-center font-mono text-tertiary text-[11px] font-bold tabular-nums">
                                                {index + 1}
                                            </div>

                                            <div className="text-center font-mono text-[color:var(--text-secondary)] text-[11px] min-w-0 truncate whitespace-nowrap tabular-nums">
                                                {prevStr}
                                            </div>

                                            {/* Weight stepper: [-] [decimal-safe input] [+] */}
                                            <div className="flex items-stretch h-11 bg-glass-inset rounded-xl overflow-hidden min-w-0">
                                                <button
                                                    type="button"
                                                    aria-label="Decrease weight"
                                                    onClick={() => stepWeight(set.id, entry.id, -2.5)}
                                                    className="w-8 shrink-0 flex items-center justify-center text-secondary hover:text-primary active:bg-glass-base transition-colors tap-highlight"
                                                >
                                                    <Minus size={14} strokeWidth={3} />
                                                </button>
                                                <GlassInput
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={weightDrafts[set.id] !== undefined ? weightDrafts[set.id] : (set.weight || '')}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        // Only accept partial-decimal shapes: digits, at most one separator.
                                                        // Accept both "." and "," since iOS shows a comma as the decimal
                                                        // key on the decimal keypad in many Spanish-language locales.
                                                        if (!/^\d*[.,]?\d*$/.test(value)) return;
                                                        setWeightDrafts(prev => ({ ...prev, [set.id]: value }));
                                                        const parsed = parseFloat(value.replace(',', '.'));
                                                        updateSet(set.id, entry.id, { weight: Number.isFinite(parsed) ? parsed : 0 });
                                                    }}
                                                    onBlur={() => {
                                                        setWeightDrafts(prev => {
                                                            if (prev[set.id] === undefined) return prev;
                                                            const next = { ...prev };
                                                            delete next[set.id];
                                                            return next;
                                                        });
                                                    }}
                                                    placeholder="0"
                                                    containerClassName="flex-1 min-w-0"
                                                    className="h-11 w-full text-center font-bold text-[15px] p-0 bg-transparent border-0 rounded-none tabular-nums focus:ring-0 focus:bg-glass-base transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Increase weight"
                                                    onClick={() => stepWeight(set.id, entry.id, 2.5)}
                                                    className="w-8 shrink-0 flex items-center justify-center text-secondary hover:text-primary active:bg-glass-base transition-colors tap-highlight"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                            </div>

                                            {/* Reps stepper: [-] [input] [+] */}
                                            <div className="flex items-stretch h-11 bg-glass-inset rounded-xl overflow-hidden min-w-0">
                                                <button
                                                    type="button"
                                                    aria-label="Decrease reps"
                                                    onClick={() => stepReps(set.id, entry.id, -1)}
                                                    className="w-8 shrink-0 flex items-center justify-center text-secondary hover:text-primary active:bg-glass-base transition-colors tap-highlight"
                                                >
                                                    <Minus size={14} strokeWidth={3} />
                                                </button>
                                                <GlassInput
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={set.reps || ''}
                                                    onChange={e => updateSet(set.id, entry.id, { reps: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    containerClassName="flex-1 min-w-0"
                                                    className="h-11 w-full text-center font-bold text-[15px] p-0 bg-transparent border-0 rounded-none tabular-nums focus:ring-0 focus:bg-glass-base transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Increase reps"
                                                    onClick={() => stepReps(set.id, entry.id, 1)}
                                                    className="w-8 shrink-0 flex items-center justify-center text-secondary hover:text-primary active:bg-glass-base transition-colors tap-highlight"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                            </div>

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

                                                        if (result.newPRs && result.newPRs.length > 0) {
                                                            // Short, tasteful burst — above the rest overlay (z-100).
                                                            confetti({
                                                                particleCount: 90,
                                                                spread: 75,
                                                                startVelocity: 38,
                                                                origin: { y: 0.7 },
                                                                zIndex: 130,
                                                                colors: ['#FF3B30', '#FFD60A', '#FFFFFF'],
                                                                disableForReducedMotion: true
                                                            });
                                                            setPrToast(`New PR — ${set.weight}${activeSession.unit} × ${set.reps}`);
                                                            if (prToastTimeout.current) clearTimeout(prToastTimeout.current);
                                                            prToastTimeout.current = window.setTimeout(() => setPrToast(null), 2500);
                                                        }
                                                    }
                                                }}
                                                className={`h-11 w-full rounded-xl flex items-center justify-center transition-all tap-highlight ${set.isDone
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-glass-inset text-[color:var(--text-tertiary)] hover:bg-glass-base hover:text-[color:var(--text-secondary)] border border-glass-elevated'
                                                    }`}
                                            >
                                                <Check size={18} strokeWidth={set.isDone ? 3.5 : 2.5} />
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
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 mt-4">
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

            {prToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2.5 bg-glass-elevated border border-accent/40 text-primary pl-4 pr-5 py-3 rounded-full shadow-glass animate-in slide-in-from-top-4 fade-in duration-200 ease-spring">
                    <Trophy size={18} className="text-accent shrink-0" />
                    <span className="font-bold text-[15px] whitespace-nowrap">{prToast}</span>
                </div>
            )}

            {lastDoneSet && (
                <div className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:w-auto md:right-6 bg-glass-elevated rounded-full p-2 flex z-40 animate-in slide-in-from-bottom-10 fade-in duration-200 ease-spring">
                    <GlassButton size="md" onClick={() => undoLastSet()} className="flex-1 px-6 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] rounded-full">
                        <Undo2 size={18} /> Undo Set
                    </GlassButton>
                </div>
            )}

            {showAdd && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex items-end md:items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-glass-inset w-full md:w-[460px] md:rounded-[32px] rounded-t-[32px] p-5 md:p-6 flex flex-col h-[80vh] md:h-[650px] animate-in slide-in-from-bottom-full md:zoom-in-95 duration-200 ease-spring shadow-2xl">
                        <div className="flex justify-between items-center mb-5 mt-1">
                            <h3 className="ios-h2 text-[color:var(--text-primary)]">Add Exercise</h3>
                            <button onClick={() => setShowAdd(false)} className="text-[color:var(--text-secondary)] p-2 bg-glass-base hover:bg-glass-elevated hover:text-[color:var(--text-primary)] rounded-full transition-colors tap-highlight">Close</button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]" size={20} />
                            <GlassInput type="text" placeholder="Search exercises..." className="pl-12 h-14 bg-glass-base rounded-2xl text-lg font-medium" />
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 pb-4">
                            {exercises.map(ex => (
                                <button
                                    key={ex.id}
                                    className="flex items-center justify-between p-4 bg-glass-base hover:bg-glass-elevated rounded-2xl text-left transition-colors tap-highlight"
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
