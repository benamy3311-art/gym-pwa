import { useEffect, useState } from 'react';
import { useRestTimer } from './useRestTimer';
import { useRestStore } from './restStore';
import { GlassButton } from '../../ui/GlassButton';
import { FastForward, Plus, Minus, X } from 'lucide-react';

export function RestTimerOverlay() {
    const { isActive, remainingMs, totalMs, source, skip, extend } = useRestTimer();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isActive) {
            setIsMounted(true);
        } else {
            const timeout = setTimeout(() => setIsMounted(false), 300); // Wait for fade out
            return () => clearTimeout(timeout);
        }
    }, [isActive]);

    if (!isMounted && !isActive) return null;

    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const m = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
    const s = (remainingSeconds % 60).toString().padStart(2, '0');

    // Calculate progress for the circular ring (0 to 1)
    const progress = totalMs > 0 ? (remainingMs / totalMs) : 0;
    const circumference = 2 * Math.PI * 120; // radius = 120
    const strokeDashoffset = circumference - progress * Math.max(0, circumference);

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-300 ease-out bg-black/85 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="absolute top-8 right-8">
                <button
                    onClick={skip}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors tap-highlight"
                >
                    <X size={24} />
                </button>
            </div>

            {source && (
                <div className="text-center mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <p className="text-accent ios-subhead uppercase tracking-widest font-bold mb-2">Resting</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{source.exerciseName}</h2>
                    <p className="ios-body text-white/70 mt-1">Set {source.setNumber} Completed</p>
                </div>
            )}

            <div className="relative flex items-center justify-center mb-12 animate-in zoom-in-95 duration-500 ease-spring">
                <svg className="w-80 h-80 -rotate-90 transform" viewBox="0 0 280 280">
                    {/* Background Track */}
                    <circle
                        cx="140"
                        cy="140"
                        r="120"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="140"
                        cy="140"
                        r="120"
                        fill="transparent"
                        stroke="var(--accent)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-250 ease-linear"
                        style={{  }}
                    />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-7xl font-extrabold tracking-tighter text-white font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {m}:{s}
                    </span>
                    {totalMs < remainingMs && (
                        <span className="absolute -bottom-8 text-accent font-bold text-sm animate-pulse">
                            + Extended
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-100">
                <GlassButton
                    variant="ghost"
                    className="w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 hover:bg-white/10"
                    onClick={() => extend(-15000)}
                >
                    <Minus size={24} className="text-white/80" />
                    <span className="text-xs font-bold text-white/50">15s</span>
                </GlassButton>

                <GlassButton
                    variant="primary"
                    className="w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center gap-2 bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)]"
                    onClick={skip}
                >
                    <FastForward size={32} fill="currentColor" />
                    <span className="text-sm font-bold tracking-wide">SKIP</span>
                </GlassButton>

                <GlassButton
                    variant="ghost"
                    className="w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 hover:bg-white/10"
                    onClick={() => extend(30000)}
                >
                    <Plus size={24} className="text-white/80" />
                    <span className="text-xs font-bold text-white/50">30s</span>
                </GlassButton>
            </div>

            <div className="flex gap-3 mt-10 animate-in slide-in-from-bottom-6 fade-in duration-500 delay-200">
                {[60, 90, 120].map(sec => (
                    <button
                        key={sec}
                        onClick={() => useRestStore.getState().startRest(sec * 1000, source || undefined)}
                        className={`px-5 py-2 rounded-full border text-sm font-bold transition-colors tap-highlight ${totalMs === sec * 1000 ? 'bg-[color:var(--accent)]/20 border-[color:var(--accent)]/50 text-[color:var(--accent)]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                        {sec}s
                    </button>
                ))}
            </div>
        </div>
    );
}
